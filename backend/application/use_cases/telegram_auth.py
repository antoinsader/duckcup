import json

from sqlalchemy.orm import Session

from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError
from telethon.sessions import StringSession

from api.core.config import settings
from application.exceptions import ERRORS_LAYERS, ApplicationError
from application.login_providers.oauth_state_manager import consume_oauth_state, generate_oauth_state, validate_oauth_state
from application.repositories.accountsRepository import AccountsRepositoryControllerDb
from application.repositories.tempKeysRepository import TempSecretsRepository
from application.use_cases.accounts import get_current_account
from domain.db_models.Accont import AccountFront
from domain.db_models.User import User
from domain.domain_models.Requests import TelegramAuthReloginRequest, TelegramAuthStartRequest, TelegramAuthVerifyRequest
from infrastructure.encryption.fernet import FernetEncrypter


TELEGRAM_PENDING_PREFIX = "telegram_pending:"
TELEGRAM_PENDING_TTL_SECONDS = 600


def _save_pending_state(state: str, payload: dict) -> None:
    encrypter = FernetEncrypter(settings.backend_secrets_encryption_key.get_secret_value())
    encrypted_payload = encrypter.encrypt(json.dumps(payload))
    temp_repo = TempSecretsRepository()
    temp_repo.set(f"{TELEGRAM_PENDING_PREFIX}{state}", encrypted_payload, TELEGRAM_PENDING_TTL_SECONDS)


def _load_pending_state(state: str) -> dict:
    temp_repo = TempSecretsRepository()
    encrypted_payload = temp_repo.get(f"{TELEGRAM_PENDING_PREFIX}{state}")
    if encrypted_payload is None:
        raise ApplicationError(
            "Telegram login session expired",
            layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            only_back_message="Pending telegram auth state not found",
        )

    encrypter = FernetEncrypter(settings.backend_secrets_encryption_key.get_secret_value())
    return json.loads(encrypter.decrypt(encrypted_payload))


def _delete_pending_state(state: str) -> None:
    temp_repo = TempSecretsRepository()
    temp_repo.del_key(f"{TELEGRAM_PENDING_PREFIX}{state}")


def get_telegram_start_form(state: str, current_user: User) -> dict:
    """Generate form for first step of telegram auth. Validate the auth state and return forms components."""
    validate_oauth_state(state, current_user.user_id, consume=False)
    return {
        "state": state,
        "provider_id": "TELEGRAM",
        "title": "Login to Telegram",
        "fields": [
            {"name": "api_id", "label": "API ID", "type": "number", "required": True},
            {"name": "api_hash", "label": "API Hash", "type": "password", "required": True},
            {"name": "phone_number", "label": "Phone Number", "type": "text", "required": True, "placeholder": "+1234567890"},
        ],
        "next_route": "/auth/telegram/start",
        "verify_route": "/auth/telegram/verify",
    }


async def telegram_auth_start(payload: TelegramAuthStartRequest, current_user: User) -> dict:
    state_data = validate_oauth_state(payload.state, current_user.user_id, consume=False)
    if state_data.get("provider") != "TELEGRAM":
        raise ApplicationError(
            "Invalid provider for telegram authentication",
            layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            only_back_message=f"state provider mismatch: {state_data}",
        )



    client = TelegramClient(StringSession(), api_id=payload.api_id, api_hash=payload.api_hash)
    try:
        await client.connect()
        sent_code = await client.send_code_request(payload.phone_number)
        pending = {
            "user_id": current_user.user_id,
            "provider": "TELEGRAM",
            "api_id": payload.api_id,
            "api_hash": payload.api_hash,
            "phone_number": payload.phone_number,
            "phone_code_hash": sent_code.phone_code_hash,
            "session": client.session.save(),
        }
        _save_pending_state(payload.state, pending)
        return {
            "state": payload.state,
            "requires_verify": True,
            "warnings": [
                "You will receive a code on your Telegram app. If you have 2FA enabled, you will also need to enter your password.",
            ],
            "fields": [
                {"name": "code", "label": "Telegram Code", "type": "text", "required": True},
                {"name": "password", "label": "2FA Password", "type": "password", "required": False, "placeholder": "Only if you have 2FA enabled"},
            ],
        }
    finally:
        await client.disconnect()


async def telegram_auth_verify(
    db: Session,
    payload: TelegramAuthVerifyRequest,
    current_user: User,
) -> AccountFront:
    validate_oauth_state(payload.state, current_user.user_id, consume=False)
    pending = _load_pending_state(payload.state)
    if pending.get("user_id") != current_user.user_id:
        raise ApplicationError(
            "Invalid telegram auth session",
            layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            only_back_message=f"user mismatch for pending telegram session: {pending.get('user_id')}",
        )



    client = TelegramClient(
        StringSession(pending["session"]),
        api_id=pending["api_id"],
        api_hash=pending["api_hash"],
    )

    try:
        await client.connect()
        try:
            await client.sign_in(
                phone=pending["phone_number"],
                code=payload.code,
                phone_code_hash=pending["phone_code_hash"],
            )
        except SessionPasswordNeededError:
            if not payload.password:
                raise ApplicationError(
                    "Telegram 2FA password is required",
                    layer=ERRORS_LAYERS.API_ROUTES_AUTH,
                    only_back_message="SessionPasswordNeededError and password missing",
                )
            await client.sign_in(password=payload.password)


        if not await client.is_user_authorized():
            raise ApplicationError(
                "Telegram authentication failed after verification",
                layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            )

        me = await client.get_me()
        account_subject = str(me.id)
        refresh_token = json.dumps(
            {
                "session": client.session.save(),
                "api_id": pending["api_id"],
                "api_hash": pending["api_hash"],
                "phone_number": pending["phone_number"],
            }
        )

        encrypter = FernetEncrypter(settings.backend_secrets_encryption_key.get_secret_value())
        acc_repo = AccountsRepositoryControllerDb(db, encrypter)
        acc_id = acc_repo.account_email_exists(account_subject, current_user.user_id)
        if acc_id:
            account = acc_repo.update_refresh_token(acc_id, refresh_token)
        else:
            account = acc_repo.create(
                current_user.user_id,
                "TELEGRAM",
                account_subject,
                refresh_token,
                provider_type="MESSAGING",
            )

        _delete_pending_state(payload.state)
        consume_oauth_state(payload.state)
        return account
    finally:
        await client.disconnect()


async def telegram_auth_relogin(
    db: Session,
    payload: TelegramAuthReloginRequest,
    current_user: User,
) -> dict:
    account = get_current_account(db, payload.account_id, current_user.user_id)
    if account.email_provider_id != "TELEGRAM":
        raise ApplicationError(
            "Account is not a Telegram account",
            layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            details={"account_id": payload.account_id, "provider": account.email_provider_id},
        )

    user_id = current_user.user_id
    encrypter = FernetEncrypter(settings.backend_secrets_encryption_key.get_secret_value())
    account_controller = AccountsRepositoryControllerDb(db, encrypter)
    refresh_token = account_controller.get_refresh_token(account.account_id, user_id)

    try:
        token_data = json.loads(refresh_token)
    except Exception as ex:
        raise ApplicationError(
            "Invalid Telegram refresh token payload",
            ex=ex,
            layer=ERRORS_LAYERS.USECASE_ERROR,
            details={"account_id": payload.account_id},
        )

    api_id = token_data.get("api_id")
    api_hash = token_data.get("api_hash")
    phone_number = token_data.get("phone_number")

    if not api_id or not api_hash:
        raise ApplicationError(
            "Telegram relogin requires api_id and api_hash in refresh token",
            layer=ERRORS_LAYERS.USECASE_ERROR,
            details={"account_id": payload.account_id},
        )
    if not phone_number:
        raise ApplicationError(
            "Telegram relogin requires phone number in refresh token. Please login again once.",
            layer=ERRORS_LAYERS.USECASE_ERROR,
            details={"account_id": payload.account_id},
        )

    state = generate_oauth_state(user_id, "TELEGRAM")
    client = TelegramClient(StringSession(), api_id=api_id, api_hash=api_hash)
    try:
        await client.connect()
        sent_code = await client.send_code_request(phone_number)
        pending = {
            "user_id": user_id,
            "provider": "TELEGRAM",
            "api_id": api_id,
            "api_hash": api_hash,
            "phone_number": phone_number,
            "phone_code_hash": sent_code.phone_code_hash,
            "session": client.session.save(),
        }
        _save_pending_state(state, pending)
        return {
            "state": state,
            "requires_verify": True,
            "provider_id": "TELEGRAM",
            "warnings": [
                "You will receive a code on your Telegram app. If you have 2FA enabled, you will also need to enter your password.",
            ],
            "fields": [
                {"name": "code", "label": "Telegram Code", "type": "text", "required": True},
                {"name": "password", "label": "2FA Password", "type": "password", "required": False, "placeholder": "Only if you have 2FA enabled"},
            ],
            "verify_route": "/auth/telegram/verify",
        }
    finally:
        await client.disconnect()
