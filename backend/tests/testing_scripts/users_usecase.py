from domain.domain_models.Requests import UserLoginRequest
from api.core.config import settings
from api.core.db import create_db_engine, create_session_factory
from application.use_cases.auth import register_user

def add_user_ttt_to_main_db():
    engine = create_db_engine(settings.database_url)
    SessionLocal = create_session_factory(engine)
    db = SessionLocal()

    try:
        register_request = UserLoginRequest(username="ttt", password="1234")
        user, _ = register_user(db, register_request)
        return user
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()