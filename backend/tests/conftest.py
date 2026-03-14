"""
Shared pytest configuration and fixtures.

All required environment variables are set here at module level so they are
available when any test module imports application code for the first time.
"""
import os
from cryptography.fernet import Fernet

# ---------------------------------------------------------------------------
# Required environment variables — set before any application module loads
# ---------------------------------------------------------------------------
_fernet_key = Fernet.generate_key().decode()

os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret-key-for-unit-testing-only!")
os.environ.setdefault("BACKEND_SECRETS_ENCRYPTION_KEY", _fernet_key)
os.environ.setdefault("SPECIAL_PASSWORD", "test-special-password")
os.environ.setdefault("GOOGLE_CLIENT_ID", "test-google-client-id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test-google-client-secret")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")
os.environ.setdefault("TEMP_KEYS_DB_PATH", ":memory:")
os.environ.setdefault("DATABASE_URL", "sqlite:///./data/sql_app.db")
os.environ.setdefault("TEST_DATABASE_URL", "sqlite:///:memory:")

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


@pytest.fixture()
def db_session():
    """
    Provide an isolated in-memory SQLite session for repository tests.
    The session is closed and all tables dropped after each test.
    """
    from api.core.db import Base
    # Importing the model registers it with Base
    import domain.db_models.User  # noqa: F401

    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
