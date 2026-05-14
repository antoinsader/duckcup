

import os
import secrets
import json
import time
from maillib.core import ApplicationError, APPLICATION_ERROR_LAYERS
from maillib.storage import TempKeyStorage


class OAuthState:
    def __init__(self, sqlite_db_path, ttl_seconds):
        self.state_ttl_seconds = int(ttl_seconds)
        self.keys_storage = TempKeyStorage(sqlite_db_path)

    def generate_oauth_token(self, user_id: int, provider_id: int) -> str:
        """Generate state from user_id, provider_id and insert it into db, returns the state token
        """
        state_token = secrets.token_urlsafe(32)
        state_payload = {
            "user_id": user_id,
            "provider": provider_id
        }
        row_key = f"oauth_state:{state_token}"
        row_val = json.dumps(state_payload)
        row_expires = int(time.time()) + self.state_ttl_seconds
        self.keys_storage.insert_key(row_key, row_val, row_expires)
        return state_token

    def read_oauth_state(self, state_token:str) -> dict:
        """Read state token and get the provider and user_id"""
        row_key = f"oauth_state:{state_token}"
        value = self.keys_storage.get_val(row_key)
        if not value:
            return None
        return json.loads(value)

    def consume_oauth_state(self, state_token: str) -> None:
        """Delete the oauth state from db"""
        row_key = f"oauth_state:{state_token}"
        self.keys_storage.delete_row(row_key)

    def validate_oauth_state(self, state_token: str, user_id:int, consume: bool = False) -> dict:
        """Validate the state, check if the user_id in the state match the current user, return the provider id if valid. If consume is True, delete the state after validation."""
        state_data = self.read_oauth_state(state_token)
        if state_data is None:
            raise ApplicationError(
                "OAUTH state not found or expired",
                layer=APPLICATION_ERROR_LAYERS.OAUTH_INVALID,
                priority=2,
            )
        state_provider_id = state_data["provider"]
        state_user_id = state_data["user_id"]

        if state_user_id is None or state_provider_id is None:
            raise ApplicationError(
                f"OAUTH does not have provider or user", 
                layer=APPLICATION_ERROR_LAYERS.OAUTH_INVALID,
                priority=2,
                back_details=f"User id: {user_id} has tried to access the state of invalid state {state_data} ")            
        if state_user_id != user_id:
            raise ApplicationError(
                f"Invalid OAUTH", 
                layer=APPLICATION_ERROR_LAYERS.OAUTH_INVALID,
                priority=2,
                back_details=f"User id: {user_id} has tried to access the state of {state_user_id} using provider: {state_provider_id}")
        if consume:
            self.consume_oauth_state(state_token)
        return state_data