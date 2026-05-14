
import json
import time

from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.errors import SessionPasswordNeededError


from maillib.core.exceptions import APPLICATION_ERROR_LAYERS, ApplicationError
from maillib.core.encryption import FernetEncrypter
from maillib.storage.temp_keys import TempKeyStorage
from maillib.auth.oauth import OAuthState

class TelegramAuthenticator:
    """
        start_form(next_route, verify_route): would create oauth state token and return form fields for the start of the authentication, return form fields
        auth_start(state_token, api_id, api_hash, phone_number): would validate the state token, send code to the phone number to continue authentication, create pending state, return form fileds
    """
    def __init__(
        self,
        db_path,
        user_id,
        fernet_encryption_key,
        provider_id="TELEGRAM",
    ):
        self.db_path = db_path
        self.user_id = user_id
        self.provider_id = provider_id
        self.ostate = OAuthState(self.db_path, 600)
        self.pending_states = TempKeyStorage(self.db_path)
        self.encrypter = FernetEncrypter(fernet_encryption_key)
        self.pending_prefix = "TELEGRAM_PENDING"

    def start_form(
        self,
        next_route:str="/auth/telegram/start",
        verify_route:str= "/auth/telegram/verify"
    ):
        state_token = self.ostate.generate_oauth_token(self.user_id, self.provider_id)
        return {
            "state": state_token,
            "provider_id": self.provider_id,
            "title": "Login to Telegram",
            "fields": [
                {"name": "api_id", "label": "API ID", "type": "number", "required": True},
                {"name": "api_hash", "label": "API Hash", "type": "password", "required": True},
                {"name": "phone_number", "label": "Phone Number", "type": "text", "required": True, "placeholder": "+1234567890"},
            ],
            "next_route": next_route,
            "verify_route": verify_route,
        }
    async def auth_start(
        self,
        state_token: str,
        api_id: int,
        api_hash: str,
        phone_number:str,
        user_id: int
    ):
        state_data = self.ostate.validate_oauth_state(state_token,user_id)
        if state_data.get("provider") != self.provider_id:
            raise ApplicationError(
                f"Invalid state, provider is not {self.provider_id} but {state_data.get('provider')}",
                layer=APPLICATION_ERROR_LAYERS.TELEGRAM_AUTHENTICATOR,
                back_details=f"state token {state_token}, user_id: {user_id}"
            )
        client = TelegramClient(StringSession(), api_id=api_id, api_hash=api_hash)
        try:
            await client.connect()
            sent_code = await client.send_code_request(phone_number)
            pending_payload = {
                'user_id': user_id,
                'provider': self.provider_id,
                'api_id': api_id,
                'api_hash': api_hash,
                'phone_number': phone_number,
                'phone_code_hash': sent_code.phone_code_hash,
                'session': client.session.save(),
            }
            encrypted_payload = self.encrypter.encrypt(json.dumps(pending_payload))
            pending_key = f"{self.pending_prefix}{state_token}"
            row_expires = int(time.time()) + 600
            self.pending_states.insert_key(pending_key, encrypted_payload, row_expires)
            return {
                "state": state_token,
                "requires_verify": True,
                "warnings": [
                    "You will receive a code on your Telegram app. If you have 2FA enabled, you will also need to enter your password.",
                ],
                "fields": [
                    {"name": "code", "label": "Telegram Code", "type": "text", "required": True},
                    {"name": "password", "label": "2FA Password", "type": "password", "required": False, "placeholder": "Only if you have 2FA enabled"},
                ],
            }

        except Exception as ex:
            raise ApplicationError(
                f"Error sending telegram code request to user_id: {user_id} ",
                layer=APPLICATION_ERROR_LAYERS.TELEGRAM_AUTHENTICATOR,
                back_details={"phone": phone_number, "api_id": api_id, "user_id": user_id},
                ex=ex
            )
        finally:
            await client.disconnect()
    async def verify(self, state_token:str, user_id: int, code:str, password=None):
        state_data = self.ostate.validate_oauth_state(state_token,user_id)
        pending_key = f"{self.pending_prefix}{state_token}"
        pending_payload_encrypted = self.pending_states.get_val(pending_key)
        if not pending_payload_encrypted:
            raise ApplicationError(
                f"Invalid payload for key: {pending_key}",
                layer=APPLICATION_ERROR_LAYERS.TELEGRAM_AUTHENTICATOR,
                back_details={'user_id': user_id}
            )
        pending_payload= json.loads(self.encrypter.decrypt(pending_payload_encrypted))
        if pending_payload.get("user_id") != user_id:
            raise ApplicationError(
                f"Wrong user telegram authentication",
                layer=APPLICATION_ERROR_LAYERS.TELEGRAM_AUTHENTICATOR,
                priority=1,
                back_details={'user_id': user_id, 'payload_user': pending_payload.get('user_id')}
            )

        client = TelegramClient(
            StringSession(pending_payload["session"]),
            api_id=pending_payload["api_id"],
            api_hash=pending_payload["api_hash"],
        )

        try:
            await client.connect()
            try:
                await client.sign_in(
                    phone=pending_payload["phone_number"],
                    code=code,
                    phone_code_hash=pending_payload["phone_code_hash"],
                )
            except SessionPasswordNeededError:
                if not password:
                    raise
                    # raise ApplicationError(
                    #     "Telegram 2FA password is required",
                    #     layer=APPLICATION_ERROR_LAYERS.TELEGRAM_AUTHENTICATOR,
                    # )
                await client.sign_in(password=password)
            if not await client.is_user_authorized():
                raise ApplicationError(
                    "Telegram authentication failed after verification",
                    layer=APPLICATION_ERROR_LAYERS.TELEGRAM_AUTHENTICATOR,
                )
            me = await client.get_me()
            account_subject = str(me.id)
            refresh_token = json.dumps(
                {
                    "session": client.session.save(),
                    "api_id": pending_payload["api_id"],
                    "api_hash": pending_payload["api_hash"],
                    "phone_number": pending_payload["phone_number"],
                }
            )
            self.pending_states.delete_row(pending_key)
            self.ostate.consume_oauth_state(state_token)
            return account_subject, refresh_token
        finally:
            await client.disconnect()