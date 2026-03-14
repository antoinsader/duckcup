from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from api.core.config import settings

from api.core import  get_db
from application.use_cases.auth import   delete_user, get_all_users
from domain.domain_models.Requests import  AdminRequest, UserDeleteRequest
from domain.db_models import  User_Front
from application.exceptions import ApplicationError, ERRORS_LAYERS
import logging

warning_logger = logging.getLogger("warning_logger")



router = APIRouter()

@router.post("/get_all_users")
def read_user_me(request: AdminRequest,  db: Session = Depends(get_db) ) -> list[User_Front]:
    """List all users when the admin password is provided.

    Authentication:
        Not session-based. Requires the admin special password in the request body.

    Request Body:
        special_password: str - Admin password gate.

    Returns:
        items: list[User_Front] - Full user list when password is valid.
        [] - Empty list when password is invalid.
    """
    if request.special_password != settings.special_password.get_secret_value():
        warning_logger.warning("Invalid admin password attempt on /get_all_users")
        raise ApplicationError("Invalid admin password", layer=ERRORS_LAYERS.API_ROUTES_IMPORTANT, priority=2)
    return  get_all_users(db)

@router.post("/delete_user")
def read_user_me(request: UserDeleteRequest,  db: Session = Depends(get_db) ) -> bool :
    """Delete a user account when the admin password is provided.

    Authentication:
        Not session-based. Requires the admin special password in the request body.

    Request Body:
        user_id: int - User identifier to delete.
        special_password: str - Admin password gate.

    Returns:
        success: bool - True when deletion succeeds.
        [] - Empty list when password is invalid (current behavior).
    """
    if request.special_password != settings.special_password.get_secret_value():
        warning_logger.warning("Invalid admin password attempt on /delete_user")
        raise ApplicationError("Invalid admin password", layer=ERRORS_LAYERS.API_ROUTES_IMPORTANT, priority=2)
    return  delete_user(db, request.user_id)
