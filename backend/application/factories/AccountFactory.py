
from sqlalchemy.orm import Session
from api.core.config import settings
from application.exceptions import ERRORS_LAYERS, ApplicationError, NotAuthenticatedError
from application.repositories.accountsRepository import AccountsRepositoryControllerDb
from domain.db_models.Accont import Account
from infrastructure.encryption.fernet import FernetEncrypter

def get_current_account( db:  Session, account_id: int, user_id: int) -> Account:
    """Making sure that account_id is valid and belongs to the user. Returning the account information. """

    try:
        encrypter = FernetEncrypter( settings.backend_secrets_encryption_key.get_secret_value())
        acc_repo = AccountsRepositoryControllerDb(db, encrypter)
        account_id = account_id
        account = acc_repo.get_by_id(account_id)
    except Exception as e:
        raise ApplicationError(
            f"Error getting account by id {account_id}",
            layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            details={"account_id": account_id},
            priority=1,
            ex=e
        )

    if not account:
        raise ApplicationError(
            f"Account was not found",
            layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            priority=4,
            details={"account_id": account_id}
        )
    if account.user_id != user_id:
        raise NotAuthenticatedError(
            f"Account was not found 2",
            layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            details={"account_id": account_id},
            only_back_message=f"User {user_id} has tried to access account not authorized {account_id}",
            priority=1
        )
    return account
