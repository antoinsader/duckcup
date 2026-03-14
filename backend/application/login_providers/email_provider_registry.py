from api.core.config import settings
from application.exceptions import ERRORS_LAYERS, ApplicationError
from application.login_providers.email_provider_base import EmailProvider, EmailProviderConfig
from application.login_providers.generic_imap_provider import GenericImapProvider, GenericImapOAuthConfig
from application.login_providers.gmail_provider import GmailProvider


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
                redirect_uri_route=f"{settings.api_url}/auth/callback",
                icon="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico",
            )
        )
        self.register(gmail_provider)
        self._register_optional_imap_providers()

    def _register_optional_imap_providers(self) -> None:
        """
        Add new IMAP OAuth providers by registering one provider class instance.
        Example (Yahoo):
            self.register(
                GenericImapProvider(
                    GenericImapOAuthConfig(
                        id="YAHOO",
                        host="imap.mail.yahoo.com",
                        label="Login to Yahoo",
                        redirect_uri_route=f"{settings.api_url}/auth/callback",
                        client_id=settings.yahoo_client_id,
                        client_secret=settings.yahoo_client_secret.get_secret_value(),
                        auth_url="https://api.login.yahoo.com/oauth2/request_auth",
                        token_url="https://api.login.yahoo.com/oauth2/get_token",
                        user_info_url="https://api.login.yahoo.com/openid/v1/userinfo",
                        email_field="email",
                        scopes=("mail-r", "openid", "email", "profile"),
                    )
                )
            )
        """
        return

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
