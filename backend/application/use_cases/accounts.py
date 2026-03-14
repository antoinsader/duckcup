

from sqlalchemy.orm import Session
from api.core.config import settings
from application.exceptions import ERRORS_LAYERS, ApplicationError, ApplicationWarning, NotAuthenticatedError
from application.factories.service_factory import get_service
from application.repositories.accountsRepository import AccountsRepositoryControllerDb
from domain.db_models import User
from domain.db_models.Accont import Account, AccountFront
from infrastructure.encryption.fernet import FernetEncrypter

from application.factories.AccountFactory import get_current_account


def get_user_accounts(user_id: int, db: Session)-> list[AccountFront]:
    """Fetch from db the accounts of user_id. Mark as need_to_login the accounts for which signing in failed."""

    try:
        encrypter = FernetEncrypter( settings.backend_secrets_encryption_key.get_secret_value())
        acc_repo = AccountsRepositoryControllerDb(db, encrypter)
        accounts = acc_repo.get_user_accounts(user_id)
        valid_accounts: list[AccountFront] = []
    except Exception as ex:
        raise ApplicationError(
            "Error fetching user accounts",
            ex = ex,
            layer=ERRORS_LAYERS.USECASE_ERROR,
            priority=2,
        )

    for account in accounts:
        try:
            account_service = get_service(db, account, user_id)
            account.inbox_count = account_service.count 
        except Exception as ex:
            account.need_to_login = True
            ApplicationWarning(
                warning="Error signing in to account",
                ex=ex,
                layer=ERRORS_LAYERS.USECASE_ERROR,
                details={"account_id": account.account_id}
            )
        finally:
            valid_accounts.append(account)

    return valid_accounts

def delete_account(db: Session, current_user:User, account_id : int ) -> bool:
    try:
        account = get_current_account(db, account_id, current_user.user_id)
        encrypter = FernetEncrypter( settings.backend_secrets_encryption_key.get_secret_value())
        acc_repo = AccountsRepositoryControllerDb(db, encrypter)
        acc_repo.delete_account(account.account_id)
        return True
    except Exception as ex:
        raise ApplicationError(
            "Error deleting account",
            ex = ex,
            layer=ERRORS_LAYERS.USECASE_ERROR,
            priority=2,
        )