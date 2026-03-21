from sqlalchemy.orm import Session

from api.core.config import settings

from application.login_providers.login_provider import EmailsProviders
from application.repositories.accountsRepository import AccountsRepositoryControllerDb

from application.exceptions import ERRORS_LAYERS, ApplicationError
from domain.db_models.Accont import Account

from infrastructure.encryption.fernet import FernetEncrypter
from infrastructure.messaging.telegram_service import TelegramMessagingService, TelegramTokenException
from infrastructure.email.email_imap_service import EmailImapService

def _get_telegram_service(db: Session, account: Account , user_id: int) -> TelegramMessagingService:
    """Connect and return  telegram service using saved tokens."""
    try:
        encrypter = FernetEncrypter( settings.backend_secrets_encryption_key.get_secret_value())
        account_controller = AccountsRepositoryControllerDb(db, encrypter)
        refresh_token = account_controller.get_refresh_token(account.account_id, user_id)

        try:
            telegram_service = TelegramMessagingService(refresh_token)
            return telegram_service
        except TelegramTokenException as ex:
            # account_controller.update_refresh_token(account.account_id, None)
            raise ApplicationError(
                    ex.message if ex.message else "Telegram authentication failed, please login again",
                    layer=ERRORS_LAYERS.LOGIN_PROVIDER,
                    ex=ex,
                    only_back_message=f"Telegram authentication failed for account_id={account.account_id}",
                )
    except Exception as ex:
        raise ApplicationError(
                "Telegram service connection failed",
                layer=ERRORS_LAYERS.LOGIN_PROVIDER,
                ex=ex,
                only_back_message=f"Unexpected error during Telegram authentication for account_id={account.account_id}",
            )

def _get_email_service(db: Session, account: Account , user_id: int) -> EmailImapService:
    """Connect and return Email service using account access token generated from refresh token."""

    encrypter = FernetEncrypter( settings.backend_secrets_encryption_key.get_secret_value())
    account_controller = AccountsRepositoryControllerDb(db, encrypter)

    providers = EmailsProviders()
    provider = providers.get_provider_from_id(account.email_provider_id)

    refresh_token = account_controller.get_refresh_token(account.account_id, user_id)
    try:
        access_token = providers.get_access_from_refresh(account.email_provider_id, refresh_token)
    except Exception as ex:
        raise ApplicationError(
                "Error getting access token from refresh token",
                layer=ERRORS_LAYERS.LOGIN_PROVIDER,
                ex=ex,
                only_back_message=f"Email service authentication failed for account_id={account.account_id}",
            )


    email_service = EmailImapService(account.email, access_token , provider.host)
    return email_service

def get_service(db: Session, account: Account, user_id: int) -> EmailImapService | TelegramMessagingService:
    """Get service for account. Either ImapService or TelegramMessagingService"""


    if account.provider_type == "EMAIL":
        return _get_email_service(db, account, user_id)

    if account.provider_type == "MESSAGING":
        if account.email_provider_id == "TELEGRAM":
            return _get_telegram_service(db, account, user_id)
        raise ApplicationError(
            "Messaging provider is not implemented yet",
            layer=ERRORS_LAYERS.USECASE_ERROR,
            only_back_message=f"No messaging service implementation for provider_id={account.email_provider_id}",
        )

    raise ApplicationError(
        "Unsupported provider type",
        layer=ERRORS_LAYERS.USECASE_ERROR,
        only_back_message=f"Unsupported provider type: {account.provider_type}",
    )
