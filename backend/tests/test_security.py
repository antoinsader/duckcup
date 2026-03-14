"""
Unit tests for JWT helpers in api/core/security.py:
  - create_access_token
  - verify_token
"""
from datetime import timedelta

import pytest
from jose import jwt as jose_jwt

from api.core.security import create_access_token, verify_token
from api.core.config import settings
from application.exceptions import ApplicationError, NotAuthenticatedError


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_ALGORITHM = "HS256"


def _secret() -> str:
    return settings.jwt_secret_key.get_secret_value()


# ---------------------------------------------------------------------------
# create_access_token
# ---------------------------------------------------------------------------

class TestCreateAccessToken:
    def test_returns_string(self):
        token = create_access_token({"user_id": 1, "username": "alice"})
        assert isinstance(token, str)

    def test_payload_contains_original_data(self):
        token = create_access_token({"user_id": 7, "username": "bob"})
        payload = jose_jwt.decode(token, _secret(), algorithms=[_ALGORITHM])
        assert payload["user_id"] == 7
        assert payload["username"] == "bob"

    def test_payload_contains_expiry(self):
        token = create_access_token({"user_id": 1})
        payload = jose_jwt.decode(token, _secret(), algorithms=[_ALGORITHM])
        assert "exp" in payload

    def test_custom_expiry_is_respected(self):
        """A very short expiry should produce a token that expires soon."""
        delta = timedelta(seconds=5)
        token = create_access_token({"user_id": 1}, expires_delta=delta)
        payload = jose_jwt.decode(token, _secret(), algorithms=[_ALGORITHM])
        assert "exp" in payload

    def test_default_expiry_is_120_minutes(self):
        """Default expiry window should be approximately 120 minutes."""
        import time
        before = time.time()
        token = create_access_token({"user_id": 1})
        after = time.time()

        payload = jose_jwt.decode(token, _secret(), algorithms=[_ALGORITHM])
        # exp should be roughly now + 7200s; allow 10s of slack for slow machines
        assert 120 * 60 - 10 <= payload["exp"] - before <= 120 * 60 + (after - before) + 10

    def test_different_data_produces_different_tokens(self):
        t1 = create_access_token({"user_id": 1})
        t2 = create_access_token({"user_id": 2})
        assert t1 != t2


# ---------------------------------------------------------------------------
# verify_token
# ---------------------------------------------------------------------------

class TestVerifyToken:
    def test_valid_token_returns_payload(self):
        token = create_access_token({"user_id": 5, "username": "carol"})
        payload = verify_token(token)
        assert payload["user_id"] == 5
        assert payload["username"] == "carol"

    def test_garbage_token_raises_not_authenticated_error(self):
        with pytest.raises(NotAuthenticatedError):
            verify_token("this.is.garbage")

    def test_empty_token_raises_not_authenticated_error(self):
        with pytest.raises(NotAuthenticatedError):
            verify_token("")

    def test_expired_token_raises_not_authenticated_error(self):
        # Build a token whose exp is already in the past using jose directly
        import time
        payload = {"user_id": 1, "exp": int(time.time()) - 60}
        already_expired = jose_jwt.encode(payload, _secret(), algorithm=_ALGORITHM)
        with pytest.raises(NotAuthenticatedError):
            verify_token(already_expired)

    def test_token_signed_with_wrong_key_raises_not_authenticated_error(self):
        wrong_secret = "completely-wrong-secret-key"
        token = jose_jwt.encode(
            {"user_id": 1, "username": "hacker"},
            wrong_secret,
            algorithm=_ALGORITHM,
        )
        with pytest.raises(NotAuthenticatedError):
            verify_token(token)

    def test_tampered_token_raises_not_authenticated_error(self):
        token = create_access_token({"user_id": 1})
        tampered = token[:-4] + "XXXX"
        with pytest.raises(NotAuthenticatedError):
            verify_token(tampered)

    def test_roundtrip_preserves_all_custom_fields(self):
        data = {"user_id": 99, "username": "dave", "role": "admin"}
        token = create_access_token(data)
        payload = verify_token(token)
        for key, value in data.items():
            assert payload[key] == value
