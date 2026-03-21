import pytest
import httpx
import os

TEST_USERNAME = os.environ.get("TEST_USERNAME")
TEST_PASSWORD = os.environ.get("TEST_PASSWORD")
BASE_URL = "http://localhost:8000"

MISSING_CREDENTIALS_MSG = """
TEST_USERNAME/TEST_PASSWORD not set — skipping tests
To enable locally:
1. nano /home/user/projects/duckcup/data/.secrets
2. Add: TEST_USERNAME=your_username, TEST_PASSWORD=your_password
3. Run: export \$(cat /app/data/.secrets | xargs) && echo '✅ Secrets loaded'

"""


@pytest.fixture
def session():
    """Unauthenticated session"""
    with httpx.Client(base_url=BASE_URL, timeout=10) as client:
        yield client

@pytest.fixture
def authenticated_session():
    """Session with user already logged in"""
    if not TEST_USERNAME or not TEST_PASSWORD:
        pytest.skip(MISSING_CREDENTIALS_MSG)
    with httpx.Client(base_url=BASE_URL, timeout=10) as client:
        login = client.post("/user/login", json={
            "username": TEST_USERNAME,
            "password": TEST_PASSWORD
        })
        assert login.status_code == 200, \
            f"❌ Login failed during fixture setup: {login.status_code} - {login.text}"
        yield client