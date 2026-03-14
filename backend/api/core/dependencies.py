"""This module contains the dependencies for the API endpoints, such as database session and user authentication."""


from fastapi import  Depends,  Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from api.core.db import  create_db_engine, create_session_factory
from api.core.security import verify_token
from api.core.config import settings


from application.exceptions import ERRORS_LAYERS, NotAuthenticatedError, InfrastructureError, INFRA_ERROR_LAYERS
from application.repositories.userRepository import UserControllerDb

from domain.db_models.User import User_Front








oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


def get_db():
    try:
        engine = create_db_engine(settings.database_url)
        localSession = create_session_factory(engine)
        db = localSession()
    except InfrastructureError:
        raise
    except Exception as ex:
        raise InfrastructureError(
            "Failed to establish database session",
            layer=INFRA_ERROR_LAYERS.ENV_CONFIGURATION,
            priority=1,
            ex=ex
        )
    try:
        yield db
    finally:
        db.close()


def get_current_user(request: Request, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User_Front:
    """Making sure that user_token exists, return the user or throws exception"""
    
    token = request.cookies.get("user_token")
    if not token:
        raise NotAuthenticatedError(f"No token found", layer=ERRORS_LAYERS.DEPENDENCY)

    payload = verify_token(token)
    if not payload:
        raise NotAuthenticatedError(f"Payload does not exist", layer=ERRORS_LAYERS.DEPENDENCY)

    user_id = payload.get("user_id")
    if not user_id:
        raise NotAuthenticatedError(f"Payload does not have user_id, please try to login again" , layer=ERRORS_LAYERS.DEPENDENCY)

    user_controller = UserControllerDb(db)
    user = user_controller.get_by_id(int(user_id))
    if not user:
        raise NotAuthenticatedError(f"User does not exists", layer=ERRORS_LAYERS.DEPENDENCY)
    return user

