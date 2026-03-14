from dataclasses import dataclass
import urllib.parse

import requests

from application.exceptions import ERRORS_LAYERS, ApplicationError, InfrastructureError, INFRA_ERROR_LAYERS
from application.login_providers.email_provider_base import EmailProvider, EmailProviderConfig


@dataclass(frozen=True)
class GenericImapOAuthConfig(EmailProviderConfig):
    client_id: str
    client_secret: str
    auth_url: str
    token_url: str
    user_info_url: str
    email_field: str = "email"
    scopes: tuple[str, ...] = ()


class GenericImapProvider(EmailProvider):
    def __init__(self, config: GenericImapOAuthConfig):
        super().__init__(config)
        self.oauth_config = config

    def build_login_url(self, state: str) -> str:
        params = {
            "client_id": self.oauth_config.client_id,
            "redirect_uri": self.redirect_uri_route,
            "response_type": "code",
            "scope": " ".join(self.oauth_config.scopes),
            "access_type": "offline",
            "prompt": "consent",
            "state": state,
        }
        return f"{self.oauth_config.auth_url}?{urllib.parse.urlencode(params)}"

    def exchange_code_for_tokens(self, code: str) -> dict:
        payload = {
            "code": code,
            "client_id": self.oauth_config.client_id,
            "client_secret": self.oauth_config.client_secret,
            "redirect_uri": self.redirect_uri_route,
            "grant_type": "authorization_code",
        }
        try:
            response = requests.post(self.oauth_config.token_url, data=payload)
            response.raise_for_status()
            return response.json()
        except Exception as ex:
            raise ApplicationError(
                f"{self.id} was not able to login",
                ex=ex,
                layer=ERRORS_LAYERS.LOGIN_PROVIDER,
                only_back_message=f"{self.id} exchange_code_for_tokens failed",
            )

    def refresh_access_token(self, refresh_token: str) -> str:
        payload = {
            "client_id": self.oauth_config.client_id,
            "client_secret": self.oauth_config.client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }
        try:
            response = requests.post(self.oauth_config.token_url, data=payload)
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
            response = requests.get(
                self.oauth_config.user_info_url,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            response.raise_for_status()
            payload = response.json()
            return payload.get(self.oauth_config.email_field)
        except Exception as ex:
            raise InfrastructureError(
                f"{self.id} provider failed to fetch user info",
                layer=INFRA_ERROR_LAYERS.UTILS,
                priority=1,
                ex=ex,
            )
