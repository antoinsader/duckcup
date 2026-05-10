from xmlrpc.client import APPLICATION_ERROR

from pydantic import Field, SecretStr, computed_field
import urllib
import requests

from core.exceptions import APPLICATION_ERROR_LAYERS, INFRA_ERROR_LAYERS, ApplicationError, InfrastructureError

class GmailAuthenticator:
    def __init__(self, google_client_id, redirect_uri_route, google_client_secret: SecretStr):
        self.google_client_id = google_client_id
        self.redirect_uri_route = redirect_uri_route
        self.google_client_secret = google_client_secret
        try:
            self.google_client_secret.get_secret_value()
        except Exception as ex:
            raise ApplicationError(
                f"Client secret error",
                layer=APPLICATION_ERROR_LAYERS.GMAIL_AUTHENTICATOR,
                ex=ex,
                priority=2
            )

    def build_login_url(self, state: str) -> str:
        """Build login url with passed state"""
        scopes = ["https://mail.google.com/", "openid", "email", "profile"]
        params = {
            "client_id": self.google_client_id,
            "redirect_uri": self.redirect_uri_route,
            "response_type": "code",
            "scope": " ".join(scopes),
            "access_type": "offline",
            "prompt": "consent",
            "state": state,
        }
        return "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)

    def exchange_code_for_token(self, code: str) -> dict:
        token_url = "https://oauth2.googleapis.com/token"

        payload = {
            "code": code,
            "client_id": self.google_client_id,
            "client_secret": self.google_client_secret.get_secret_value(),
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
                layer=APPLICATION_ERROR_LAYERS.GMAIL_AUTHENTICATOR,
            )
    def refresh_access_token(self, refresh_token: str) -> str:
        token_url = "https://oauth2.googleapis.com/token"
        payload = {
            "client_id": self.google_client_id,
            "client_secret": self.google_client_secret.get_secret_value(),
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
                layer=APPLICATION_ERROR_LAYERS.GMAIL_AUTHENTICATOR,
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
            raise ApplicationError(
                "get_google_user_info has failed to do the request",
                layer=APPLICATION_ERROR_LAYERS.GMAIL_AUTHENTICATOR,
                priority=1,
                ex=ex,
            )
