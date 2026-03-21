import pytest
import httpx
import os

BASE_URL = os.environ.get("BASE_URL", "http://localhost:8000")

# ── Tests ──────────────────────────────────────────────────────
class TestGetUserAccounts:

    def test_get_accounts_authenticated(self, authenticated_session):
        """Logged in user should get their accounts list"""
        response = authenticated_session.post("account/get_user_accounts")
        assert response.status_code == 200, \
            f"❌ Expected 200 but got: {response.status_code} - {response.text}"

        data = response.json()
        assert isinstance(data, list), \
            f"❌ Expected a list but got: {type(data)}"
        print(f"\n✅ Got {len(data)} accounts: {data}")

    def test_get_accounts_unauthenticated(self, session):
        """No cookie should be rejected"""
        response = session.post("account/get_user_accounts")
        assert response.status_code in [401, 403], \
            f"❌ Expected 401/403 but got: {response.status_code} - {response.text}"
        print(f"\n✅ Unauthenticated correctly rejected: {response.status_code}")