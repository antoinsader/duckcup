


import pytest
import httpx

BASE_URL = "http://localhost:8000"  # direct to backend

@pytest.fixture
def session():
    """Single client that persists cookies across requests"""
    with httpx.Client(base_url=BASE_URL, timeout=10) as client:
        yield client


class TestFlow:
    def test_full_flow(self, session):
        # Step 1 — Login (cookie is set automatically on the client)
        login_response = session.post("/user/login", json={
            "username": "testuser",
            "password": "testpassword"
        })
        assert login_response.status_code == 200
        print(f"\n✅ Login: {login_response.json()}")

        # Step 2 — Check cookie was received
        cookie = session.cookies.get("user_token")
        assert cookie is not None
        print(f"\n✅ Cookie received: {cookie[:20]}...")  # print first 20 chars only

        # Step 3 — Use protected route (cookie sent automatically)
        protected_response = session.get("/your-protected-route")
        assert protected_response.status_code == 200
        print(f"\n✅ Protected route: {protected_response.json()}")

        # Step 4 — Test unauthorized access (new client = no cookie)
        fresh_client = httpx.Client(base_url=BASE_URL)
        unauth_response = fresh_client.get("/your-protected-route")
        assert unauth_response.status_code == 401
        print(f"\n✅ Unauthorized correctly blocked: {unauth_response.status_code}")