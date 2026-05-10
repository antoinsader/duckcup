import time
import pytest
from maillib.auth.oauth import OAuthState
from maillib.core.exceptions import APPLICATION_ERROR_LAYERS, ApplicationError


@pytest.fixture
def oauth_state(tmp_path):
    return OAuthState(str(tmp_path / 'oauth.db'), ttl_seconds=300)


@pytest.fixture
def expired_oauth_state(tmp_path):
    # ttl_seconds=-1 means expires_at = time.time() - 1, already in the past
    return OAuthState(str(tmp_path / 'expired.db'), ttl_seconds=-1)


class TestOAuthState:
    def test_generate_returns_string_token(self, oauth_state):
        token = oauth_state.generate_oauth_state(user_id=1, provider_id=42)
        assert isinstance(token, str)
        assert len(token) > 0

    def test_generate_tokens_are_unique(self, oauth_state):
        token1 = oauth_state.generate_oauth_state(1, 42)
        token2 = oauth_state.generate_oauth_state(1, 42)
        assert token1 != token2

    def test_read_valid_state_returns_data(self, oauth_state):
        token = oauth_state.generate_oauth_state(user_id=5, provider_id=10)
        result = oauth_state.read_oauth_state(token)
        assert result == {'user_id': 5, 'provider': 10}

    def test_read_nonexistent_state_returns_none(self, oauth_state):
        result = oauth_state.read_oauth_state('nonexistent_token')
        assert result is None

    def test_read_expired_state_returns_none(self, expired_oauth_state):
        token = expired_oauth_state.generate_oauth_state(1, 2)
        assert expired_oauth_state.read_oauth_state(token) is None

    def test_read_expired_state_deletes_it(self, expired_oauth_state):
        token = expired_oauth_state.generate_oauth_state(1, 2)
        expired_oauth_state.read_oauth_state(token)  # triggers delete
        assert expired_oauth_state.read_oauth_state(token) is None

    def test_consume_removes_state(self, oauth_state):
        token = oauth_state.generate_oauth_state(1, 42)
        oauth_state.consume_oauth_state(token)
        assert oauth_state.read_oauth_state(token) is None

    def test_validate_returns_state_data(self, oauth_state):
        token = oauth_state.generate_oauth_state(user_id=7, provider_id=3)
        result = oauth_state.validate_oauth_state(token, user_id=7, consume=False)
        assert result['user_id'] == 7
        assert result['provider'] == 3

    def test_validate_wrong_user_raises(self, oauth_state):
        token = oauth_state.generate_oauth_state(user_id=7, provider_id=3)
        with pytest.raises(ApplicationError) as exc_info:
            oauth_state.validate_oauth_state(token, user_id=99, consume=False)
        assert exc_info.value.layer == APPLICATION_ERROR_LAYERS.OAUTH_INVALID

    def test_validate_consume_true_removes_state(self, oauth_state):
        token = oauth_state.generate_oauth_state(user_id=1, provider_id=2)
        oauth_state.validate_oauth_state(token, user_id=1, consume=True)
        assert oauth_state.read_oauth_state(token) is None

    def test_validate_consume_false_keeps_state(self, oauth_state):
        token = oauth_state.generate_oauth_state(user_id=1, provider_id=2)
        oauth_state.validate_oauth_state(token, user_id=1, consume=False)
        assert oauth_state.read_oauth_state(token) is not None

    def test_validate_missing_state_raises(self, oauth_state):
        with pytest.raises(ApplicationError) as exc_info:
            oauth_state.validate_oauth_state('fake_token', user_id=1, consume=False)
        assert exc_info.value.layer == APPLICATION_ERROR_LAYERS.OAUTH_INVALID
