from dataclasses import dataclass

from application.login_providers.base_messaging_provider import MessagingProvider


@dataclass(frozen=True)
class TelegramProviderConfig:
    id: str = "TELEGRAM"
    label: str = "Login to Telegram"


class TelegramProvider(MessagingProvider):
    def __init__(self, config: TelegramProviderConfig | None = None):
        self.config = config or TelegramProviderConfig()

    @property
    def id(self) -> str:
        return self.config.id

    def start_login(self, user_id: int, **kwargs) -> dict:
        raise NotImplementedError("Telegram start_login is not implemented yet")

    def verify_login(self, verification_data: dict, **kwargs) -> dict:
        raise NotImplementedError("Telegram verify_login is not implemented yet")

    def get_user(self, session_data: dict, **kwargs) -> dict:
        raise NotImplementedError("Telegram get_user is not implemented yet")
