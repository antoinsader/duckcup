from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from application.login_providers.base_provider import Provider, ProviderType


@dataclass(frozen=True)
class EmailProviderConfig:
    id: str
    host: str
    label: str
    redirect_uri_route: str
    icon: str | None = field(default=None, kw_only=True)


@dataclass
class EmailProviderFront:
    id: str
    label: str
    icon: str | None = None

    @classmethod
    def from_provider_config(cls, config: EmailProviderConfig) -> "EmailProviderFront":
        return cls(id=config.id, label=config.label, icon=config.icon)


class EmailProvider(Provider, ABC):
    def __init__(self, config: EmailProviderConfig):
        self.config = config

    @property
    def id(self) -> str:
        return self.config.id

    @property
    def host(self) -> str:
        return self.config.host

    @property
    def label(self) -> str:
        return self.config.label

    @property
    def icon(self) -> str | None:
        return self.config.icon

    @property
    def redirect_uri_route(self) -> str:
        return self.config.redirect_uri_route

    @property
    def provider_type(self) -> ProviderType:
        return ProviderType.EMAIL

    def authenticate(self, user_id: int, **kwargs) -> dict:
        code = kwargs.get("code")
        if code is None:
            raise ValueError("code is required for email provider authentication")
        return self.exchange_code_for_tokens(code)

    def get_service(self, credentials: dict, **kwargs):
        return None

    @abstractmethod
    def build_login_url(self, state: str) -> str:
        pass

    @abstractmethod
    def exchange_code_for_tokens(self, code: str) -> dict:
        pass

    @abstractmethod
    def refresh_access_token(self, refresh_token: str) -> str:
        pass

    @abstractmethod
    def get_account_email(self, access_token: str) -> str:
        pass
