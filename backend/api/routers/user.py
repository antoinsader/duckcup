from fastapi import APIRouter, Depends, Response, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from api.core import  get_db, get_current_user
from api.core.config import settings

from application.use_cases.auth import  login_user,  register_user

from domain.db_models import User, User_Front
from domain.domain_models.Requests import   UserLoginRequest




router = APIRouter()


@router.post("/login")
def login_route(login_request: UserLoginRequest, response: Response, db: Session = Depends(get_db)) -> User_Front:
    """Authenticate a local user and create a session cookie.

    Authentication:
        Not required.

    Request Body:
        username: str - Local account username.
        password: str - Local account password.

    Returns:
        user_id: int - Authenticated user identifier.
        username: str - Authenticated username.
        Cookie side effect: sets user_token on the response.
    """
    username = login_request.username
    password = login_request.password
    user, access_token = login_user(db, username=username, password=password )
    response.set_cookie(
        key="user_token",
        value=access_token,
        httponly=True,
        samesite="lax"
    )
    return user

@router.post("/register")
def register_route(register_request: UserLoginRequest, response: Response, db: Session = Depends(get_db)) -> User_Front:
    """Register a local user and create a session cookie.

    Authentication:
        Not required.

    Request Body:
        username: str - Desired local account username.
        password: str - Desired local account password.

    Returns:
        user_id: int - Newly created user identifier.
        username: str - Created username.
        Cookie side effect: sets user_token on the response.
    """

    user, access_token = register_user(db, register_request)
    response.set_cookie(
        key="user_token",
        value=access_token,
        httponly=True,
        samesite="lax"
    )
    return user

@router.get("/me")
def read_user_me(request: Request, current_user : User = Depends(get_current_user) ) -> User_Front:
    """Return the currently authenticated user.

    Authentication:
        Required.

    Request Body:
        None.

    Returns:
        user_id: int - Authenticated user identifier.
        username: str - Authenticated username.
    """
    return current_user





@router.post("/logout")
def logout():
    """Clear the local session cookie and redirect to the frontend.

    Authentication:
        Not required.

    Request Body:
        None.

    Returns:
        redirect_url: str - Frontend URL target.
        Cookie side effect: removes user_token from the response.
    """
    frontend_url = settings.frontend_url
    resp = RedirectResponse(url=frontend_url)
    resp.delete_cookie("user_token")
    return resp
