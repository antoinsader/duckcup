from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any
import requests
import urllib.parse

from urllib.parse import urlencode
from enum import Enum


from api.core.config import settings
from application.exceptions import ERRORS_LAYERS, INFRA_ERROR_LAYERS, ApplicationError, InfrastructureError
from application.login_providers.oauth_state_manager import generate_oauth_state




class AuthFlow(str, Enum):
    OAUTH_REDIRECT = "oauth_redirect"
    STAGED_CREDENTIALS = "staged_credentials"


class ProviderType(str, Enum):
    EMAIL = "EMAIL"
    MESSAGING = "MESSAGING"



@dataclass
class LoginProviderFront:
    id: str
    label: str
    provider_type: str
    auth_flow: AuthFlow
    icon: str | None = None
    start_route: str | None = None
    verify_route: str | None = None
    relogin_route: str | None = None

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




class Provider(ABC):
    @property
    @abstractmethod
    def id(self) -> str:
        pass

    @property
    @abstractmethod
    def provider_type(self) -> ProviderType:
        pass

    @abstractmethod
    def authenticate(self, user_id: int, **kwargs) -> dict:
        pass

    @abstractmethod
    def get_service(self, credentials: dict, **kwargs) -> Any:
        pass


class MessagingProvider(Provider, ABC):
    @property
    def provider_type(self) -> ProviderType:
        return ProviderType.MESSAGING

    @abstractmethod
    def start_login(self, user_id: int, **kwargs) -> dict:
        pass

    @abstractmethod
    def verify_login(self, verification_data: dict, **kwargs) -> dict:
        pass

    @abstractmethod
    def get_user(self, session_data: dict, **kwargs) -> dict:
        pass

    def authenticate(self, user_id: int, **kwargs) -> dict:
        return self.start_login(user_id, **kwargs)

    def get_service(self, credentials: dict, **kwargs):
        return None



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





class EmailProviderRegistry:
    def __init__(self):
        self._providers: dict[str, EmailProvider] = {}
        self._register_default_providers()

    def _register_default_providers(self):
        gmail_provider = GmailProvider(
            EmailProviderConfig(
                id="GMAIL",
                host="imap.gmail.com",
                label="Login to Gmail",
                redirect_uri_route=f"{settings.google_redirect_uri}",
                icon="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico",
            )
        )
        self.register(gmail_provider)


    def register(self, provider: EmailProvider) -> None:
        self._providers[provider.id] = provider

    def get(self, provider_id: str) -> EmailProvider:
        provider = self._providers.get(provider_id)
        if provider is None:
            raise ApplicationError(
                f"Provider was not found, provider_id: {provider_id}",
                layer=ERRORS_LAYERS.META,
            )
        return provider

    def list_all(self) -> list[EmailProvider]:
        return list(self._providers.values())


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


class EmailsProviders:

    def __init__(self):
        self.registry = EmailProviderRegistry()

    @property
    def providers(self) -> list[EmailProvider]:
        return self.registry.list_all()

    def get_providers_front(self) -> list[EmailProviderFront]:
        return [EmailProviderFront.from_provider_config(provider.config) for provider in self.providers]

    def get_provider_from_id(self, id: str) -> EmailProvider:
        return self.registry.get(id)

    def get_login_url(self, provider_id: str, user_id: int) -> str:
        provider = self.get_provider_from_id(provider_id)
        state = generate_oauth_state(user_id, provider_id)
        return provider.build_login_url(state)

    def get_access_from_refresh(self, provider_id: str, refresh_token: str) -> str:
        provider = self.get_provider_from_id(provider_id)
        return provider.refresh_access_token(refresh_token)

    def exchange_code_for_tokens(self, provider_id: str, code: str) -> dict:
        provider = self.get_provider_from_id(provider_id)
        return provider.exchange_code_for_tokens(code)

    def get_account_email(self, provider_id: str, access_token: str) -> str:
        provider = self.get_provider_from_id(provider_id)
        return provider.get_account_email(access_token)

class GmailProvider(EmailProvider):
    def build_login_url(self, state: str) -> str:
        scopes = ["https://mail.google.com/", "openid", "email", "profile"]
        params = {
            "client_id": settings.google_client_id,
            "redirect_uri": self.redirect_uri_route,
            "response_type": "code",
            "scope": " ".join(scopes),
            "access_type": "offline",
            "prompt": "consent",
            "state": state,
        }
        return "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)

    def exchange_code_for_tokens(self, code: str) -> dict:
        token_url = "https://oauth2.googleapis.com/token"
        payload = {
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret.get_secret_value(),
            "redirect_uri": self.redirect_uri_route,
            "grant_type": "authorization_code",
        }
        try:
            response = requests.post(token_url, data=payload)
            response.raise_for_status()
            return response.json()
        except Exception as ex:
            raise ApplicationError(
                "Google was not able to login",
                ex=ex,
                layer=ERRORS_LAYERS.LOGIN_PROVIDER,
                only_back_message="gmail exchange_code_for_tokens failed",
            )

    def refresh_access_token(self, refresh_token: str) -> str:
        token_url = "https://oauth2.googleapis.com/token"
        payload = {
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret.get_secret_value(),
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }

        try:
            response = requests.post(token_url, data=payload)
            response.raise_for_status()
            data = response.json()
            return data["access_token"]
        except Exception as ex:
            raise ApplicationError(
                "Failed to refresh access token, please try to login again",
                layer=ERRORS_LAYERS.LOGIN_PROVIDER,
                ex=ex,
                only_back_message=f"Failed to refresh access token for provider {self.id}: {str(ex)}",
            )

    def get_account_email(self, access_token: str) -> str:
        try:
            user_info_url = "https://www.googleapis.com/oauth2/v1/userinfo"
            response = requests.get(user_info_url, headers={"Authorization": f"Bearer {access_token}"})
            response.raise_for_status()
            google_user = response.json()
            return google_user.get("email")
        except Exception as ex:
            raise InfrastructureError(
                "get_google_user_info has failed to do the request",
                layer=INFRA_ERROR_LAYERS.UTILS,
                priority=1,
                ex=ex,
            )


class ProvidersCatalog:
    TELEGRAM_PROVIDER_ID = "TELEGRAM"

    def __init__(self):
        self.email_providers = EmailsProviders()

    def get_providers_front(self) -> list[LoginProviderFront]:
        providers: list[LoginProviderFront] = [
            LoginProviderFront(
                id=provider.id,
                label=provider.label,
                provider_type="EMAIL",
                auth_flow=AuthFlow.OAUTH_REDIRECT,
                icon=provider.icon,
            )
            for provider in self.email_providers.providers
        ]

        providers.append(
            LoginProviderFront(
                id=self.TELEGRAM_PROVIDER_ID,
                label="Login to Telegram",
                provider_type="MESSAGING",
                auth_flow=AuthFlow.STAGED_CREDENTIALS,
                start_route="/auth/telegram/start_form",
                verify_route="/auth/telegram/verify",
                relogin_route="/auth/telegram/relogin",
                icon="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/2048px-Telegram_logo.svg.png",
            )
        )
        return providers

    def get_login_url(self, provider_id: str, user_id: int) -> str:
        """Get the login url of the provider, with query parameters and state"""
        if provider_id == self.TELEGRAM_PROVIDER_ID:
            state = generate_oauth_state(user_id, provider_id)
            query = urlencode(
                {
                    "state": state,
                    "provider_id": provider_id,
                    "redirect_uri": settings.frontend_url,
                }
            )
            return f"{settings.api_url}/auth/telegram/start_form?{query}"

        return self.email_providers.get_login_url(provider_id, user_id)

    def is_telegram_provider(self, provider_id: str) -> bool:
        return provider_id == self.TELEGRAM_PROVIDER_ID

