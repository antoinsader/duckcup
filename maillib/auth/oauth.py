

import secrets
import json
import time
from maillib.core import StorageCol, SqliteTable, ApplicationError, APPLICATION_ERROR_LAYERS


class TempOAuthStorage:
    """Save OAuth states temporarily in db"""
    def __init__(self, db_path):
        """db_path is sqlite path where to save the table"""
        self.db_path = db_path





class OAuthState:
    def __init__(self, sqlite_db_path, ttl_seconds):
        self.state_ttl_seconds = int(ttl_seconds)
        cols = [
            StorageCol('key', 'TEXT', is_primary_key=True ),
            StorageCol('value', 'TEXT' ),
            StorageCol('expires_at', 'INTEGER' ),
        ]
        table = SqliteTable(sqlite_db_path, "temporary_oauth_keys", cols)
        table.create_table()
        self.table = table
    def generate_oauth_state(self, user_id: int, provider_id: int) -> str:
        """Generate state from user_id, provider_id and insert it into db, returns the state token
        """
        state_token = secrets.token_urlsafe(32)
        row_key = f"oauth_state:{state_token}"
        state_payload = {
            "user_id": user_id,
            "provider": provider_id
        }
        row_val = json.dumps(state_payload)
        row_expires = int(time.time()) + self.state_ttl_seconds
        insert_dict = {
            "key": row_key,
            "value": row_val,
            "expires_at": row_expires
        }
        self.table.insert_into_table(insert_dict)
        return state_token

    def read_oauth_state(self, state_token:str) -> dict:
        """Read state token and get the provider and user_id"""
        row_key = f"oauth_state:{state_token}"
        now = int(time.time())
        row = self.table.select_row('value, expires_at', {
            'key': row_key
        })
        if not row:
            return None
        value, expires_at = row
        if expires_at < now:
            where_dict = {
                "key": row_key
            }
            self.table.delete_row(where_dict)
            return None
        return json.loads(value)

    def consume_oauth_state(self, state_token: str) -> None:
        """Delete the oauth state from db"""
        row_key = f"oauth_state:{state_token}"
        where_dict = {
            "key": row_key
        }
        self.table.delete_row(where_dict)

    def validate_oauth_state(self, state_token: str, user_id:int, consume: bool) -> dict:
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