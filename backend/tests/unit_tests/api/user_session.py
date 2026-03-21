import pytest
import os

TEST_USERNAME = os.environ.get("TEST_USERNAME")
TEST_PASSWORD = os.environ.get("TEST_PASSWORD")

MISSING_CREDENTIALS_MSG = """
TEST_USERNAME/TEST_PASSWORD not set — skipping tests
To enable locally:
1. nano /home/user/projects/duckcup/data/.secrets
2. Add: TEST_USERNAME=your_username, TEST_PASSWORD=your_password
3. Run: export \$(cat /app/data/.secrets | xargs) && echo '✅ Secrets loaded'

"""


# ── Skip entire module if no credentials ──────────────────────
def _check_credentials():
    if not TEST_USERNAME or not TEST_PASSWORD:
        pytest.skip(
            MISSING_CREDENTIALS_MSG,
            allow_module_level=True
        )

_check_credentials()

# ── Tests ──────────────────────────────────────────────────────
class TestUserLogin:

    def test_login_success(self, session):
        """Valid credentials should return 200 and set user_token cookie"""
        response = session.post("/user/login", json={
            "username": TEST_USERNAME,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, \
            f"❌ Login failed: {response.status_code} - {response.text}"
        print(f"\n✅ Login success: {response.json()}")

        cookie = session.cookies.get("user_token")
        assert cookie is not None, \
            "❌ user_token cookie not set after successful login"
        print(f"\n✅ Cookie received: {cookie[:20]}...")

    def test_login_wrong_password(self, session):
        """Wrong password should return 401"""
        response = session.post("/user/login", json={
            "username": TEST_USERNAME,
            "password": "wrong_password_123"
        })
        assert response.status_code == 401, \
            f"❌ Expected 401 but got: {response.status_code} - {response.text}"
        print(f"\n✅ Wrong password correctly rejected: {response.status_code}")

    def test_login_wrong_username(self, session):
        """Non-existent user should return 401 or 404"""
        response = session.post("/user/login", json={
            "username": "nonexistent_user_xyz",
            "password": TEST_PASSWORD
        })
        assert response.status_code in [401, 404], \
            f"❌ Expected 401/404 but got: {response.status_code} - {response.text}"
        print(f"\n✅ Wrong username correctly rejected: {response.status_code}")

    def test_login_missing_fields(self, session):
        """Missing fields should return 422"""
        response = session.post("/user/login", json={})
        assert response.status_code == 422, \
            f"❌ Expected 422 but got: {response.status_code} - {response.text}"
        print(f"\n✅ Missing fields correctly rejected: {response.status_code}")