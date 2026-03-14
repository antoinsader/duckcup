import urllib.parse

import requests

from api.core.config import settings
from application.exceptions import ERRORS_LAYERS, INFRA_ERROR_LAYERS, ApplicationError, InfrastructureError
from application.login_providers.email_provider_base import EmailProvider


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
