from fastapi import APIRouter, Depends, Response, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from api.core.dependencies import  get_db, get_current_user
from api.core.config import settings

from application.use_cases.auth import  login_provider_callback
from application.use_cases.telegram_auth import get_telegram_start_form, telegram_auth_relogin, telegram_auth_start, telegram_auth_verify

from domain.db_models import User
from domain.db_models.Accont import AccountFront
from domain.domain_models.Requests import TelegramAuthReloginRequest, TelegramAuthStartRequest, TelegramAuthVerifyRequest





router = APIRouter()

# ? this is duplicated because google has the callback url hardcoded, I will try to make it more generic in the future
@router.get("/google_callback")
def google_callback(
    request: Request,
    code: str, 
    state: str, 
    response: Response,
    db:Session=Depends(get_db) , 
    current_user : User = Depends(get_current_user)
    ):
    """Complete the provider callback flow and redirect to the frontend.

    Authentication:
        Required.

    Request Body:
        None.
        Query Params:
            code: str - Provider authorization code.
            state: str - Anti-forgery state token.

    Returns:
        redirect_url: str - Frontend URL after provider callback processing.
    """

    account = login_provider_callback(db, code, state, current_user)

    frontend_url = settings.frontend_url
    resp = RedirectResponse(frontend_url)
    return resp



@router.get("/telegram/start_form")
def telegram_start_form(state: str, user: User = Depends(get_current_user)) -> dict:
    """Return the initial Telegram authentication form state.

    Authentication:
        Required.

    Request Body:
        None.
        Query Params:
            state: str - Temporary auth state token.

    Returns:
        state: str - Echoed/validated flow state.
        start payload: dict - Values required by the next Telegram auth step.
    """
    return get_telegram_start_form(state, user)


@router.post("/telegram/start")
async def telegram_start(payload: TelegramAuthStartRequest, user: User = Depends(get_current_user)) -> dict:
    """Start the Telegram authentication flow for a user account.

    Authentication:
        Required.

    Request Body:
        state: str - Temporary auth state token.
        api_id: int - Telegram application API ID.
        api_hash: str - Telegram application API hash.
        phone_number: str - Target Telegram phone number.

    Returns:
        auth_step: str - Current flow status.
        state: str - State token to continue verification.
        details: dict - Additional provider instructions for the client.
    """
    return await telegram_auth_start(payload, user)


@router.post("/telegram/relogin")
async def telegram_relogin(
    payload: TelegramAuthReloginRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Restart authentication for an existing Telegram account.

    Authentication:
        Required.

    Request Body:
        account_id: int - Telegram account identifier to reconnect.

    Returns:
        auth_step: str - Current relogin status.
        state: str - State token to continue verification.
        details: dict - Additional provider instructions for the client.
    """
    return await telegram_auth_relogin(db, payload, user)


@router.post("/telegram/verify")
async def telegram_verify(
    payload: TelegramAuthVerifyRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AccountFront:
    """Verify a Telegram login attempt and persist the connected account.

    Authentication:
        Required.

    Request Body:
        state: str - Temporary auth state token.
        code: str - Verification code received from Telegram.
        password: str | None - 2FA password when required.

    Returns:
        account_id: int - Linked account identifier.
        provider_id: str - Provider name for this account.
        account label fields: str - Display metadata returned by AccountFront.
    """
    return await telegram_auth_verify(db, payload, user)
