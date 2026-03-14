from application.login_providers.email_provider_base import EmailProvider, EmailProviderFront
from application.login_providers.email_provider_registry import EmailProviderRegistry
from application.login_providers.oauth_state_manager import generate_oauth_state


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
