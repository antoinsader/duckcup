from dataclasses import dataclass
from urllib.parse import urlencode
from enum import Enum


from api.core.config import settings
from application.login_providers.login_providers import EmailsProviders
from application.login_providers.oauth_state_manager import generate_oauth_state



class AuthFlow(str, Enum):
    OAUTH_REDIRECT = "oauth_redirect"
    STAGED_CREDENTIALS = "staged_credentials"


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
