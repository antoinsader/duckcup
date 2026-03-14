
import sqlite3
import time
import json
from typing import Optional, Any
from api.core.config import settings
from application.exceptions import InfrastructureError, INFRA_ERROR_LAYERS

class TempSecretsRepository:
    def __init__(self):
        self.db_path = settings.temp_keys_db_path
        self._initialize()


    def _get_connection(self):
        try:
            return sqlite3.connect(self.db_path)
        except sqlite3.Error as ex:
            raise InfrastructureError("Failed to connect to temp secrets database", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)

    def _initialize(self):
        try:
            with self._get_connection() as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS temp_secrets (
                        key TEXT PRIMARY KEY,
                        value TEXT NOT NULL,
                        expires_at INTEGER NOT NULL
                    )
                """)
                conn.commit()
        except InfrastructureError:
            raise
        except sqlite3.Error as ex:
            raise InfrastructureError("Failed to initialize temp secrets database", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)

    def set(self, key: str, value: Any, ttl_seconds: int):
        expires_at = int(time.time()) + ttl_seconds
        serialized_value = json.dumps(value)
        try:
            with self._get_connection() as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO temp_secrets (key, value, expires_at)
                    VALUES (?, ?, ?)
                """, (key, serialized_value, expires_at))
                conn.commit()
        except InfrastructureError:
            raise
        except sqlite3.Error as ex:
            raise InfrastructureError("Failed to store temp secret", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)

    def get(self, key: str) -> Optional[Any]:
        now = int(time.time())
        try:
            with self._get_connection() as conn:
                cursor = conn.execute("""
                    SELECT value, expires_at FROM temp_secrets
                    WHERE key = ?
                """, (key,))
                row = cursor.fetchone()

                if not row:
                    return None

                value, expires_at = row

                if expires_at < now:
                    # Expired → delete and return None
                    conn.execute("DELETE FROM temp_secrets WHERE key = ?", (key,))
                    conn.commit()
                    return None

                return json.loads(value)
        except InfrastructureError:
            raise
        except sqlite3.Error as ex:
            raise InfrastructureError("Failed to retrieve temp secret", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)

    def del_key(self, key):
        try:
            with self._get_connection() as conn:
                conn.execute("DELETE FROM temp_secrets WHERE key= ?", (key,))
                conn.commit()
        except InfrastructureError:
            raise
        except sqlite3.Error as ex:
            raise InfrastructureError("Failed to delete temp secret", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)

    def cleanup_expired(self):
        now = int(time.time())
        try:
            with self._get_connection() as conn:
                conn.execute("DELETE FROM temp_secrets WHERE expires_at < ?", (now,))
                conn.commit()
        except InfrastructureError:
            raise
        except sqlite3.Error as ex:
            raise InfrastructureError("Failed to clean up expired temp secrets", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)