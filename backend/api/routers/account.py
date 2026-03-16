
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.core.dependencies import    get_db, get_current_user
from api.core.config import settings

from application.exceptions import ERRORS_LAYERS, ApplicationError
from application.login_providers.login_provider import ProvidersCatalog
from application.use_cases.accounts import delete_account, get_user_accounts

from domain.db_models import User
from domain.db_models.Accont import  AccountFront
from domain.domain_models.Requests import AccountRequest, AccountProviderRequest




router = APIRouter()





@router.post("/login_with_provider")
async def add_account_provider_route(payload:AccountProviderRequest, current_user : User = Depends(get_current_user)) -> dict:
    """Create a provider login URL for the authenticated user.

    Authentication:
        Required.

    Request Body:
        provider_id: str - Account provider identifier to connect (for example, gmail or telegram).

    Returns:
        redirect_url: str - Provider login URL for the authenticated user.
    """

    provider_id = payload.provider_id
    if not provider_id:
        raise ApplicationError(
            f"Provider id needs to be provided",
            layer=ERRORS_LAYERS.API_ROUTES_ERROR
        )

    providers_catalog = ProvidersCatalog()
    login_url = providers_catalog.get_login_url(provider_id, current_user.user_id)
    return {"redirect_url": login_url}



@router.post("/get_user_accounts")
def get_user_accounts_route(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) ->  list[AccountFront]:
    """List the connected accounts for the authenticated user.

    Authentication:
        Required.

    Request Body:
        None.

    Returns:
        items: list[AccountFront] - Connected accounts for the current user.
    """


    if settings.testing:
        from application.testing_data import get_testing_accounts
        return get_testing_accounts()


    return get_user_accounts(current_user.user_id, db)


@router.post("/delete_account")
def delete_ds(payload: AccountRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Delete one connected account owned by the current user.

    Authentication:
        Required.

    Request Body:
        account_id: int - Connected account identifier to delete.

    Returns:
        success: bool - True when the account is deleted.
    """
    del_req = delete_account(db, current_user, payload.account_id)
    return {"success": del_req}
