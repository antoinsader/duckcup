

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, OperationalError

from application.exceptions import ERRORS_LAYERS, ApplicationError, InfrastructureError, INFRA_ERROR_LAYERS
from domain.db_models.Accont import Account, AccountFront
from infrastructure.encryption._encrypter import Encrypter




class AccountsRepositoryControllerDb:
    def __init__(self, db: Session, encrypter : Encrypter):
        """Requires encrypter to encrypt and decrypt refresh tokens"""
        self.encrypter = encrypter
        self.db = db

    def account_email_exists(self, email : str, user_id: int) -> int:
        """Returns account id of the email or None"""
        try:
            acc = self.db.query(Account).filter(Account.email == email).filter(Account.user_id == user_id).first()
            return acc.account_id if acc is not None else None
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while checking account email", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error checking account email existence", layer=ERRORS_LAYERS.DATABASE, ex=ex)

    def get_by_id(self, account_id: int) -> AccountFront:
        """Get account front by account_id"""
        try:
            acc = self.db.query(Account).filter(Account.account_id == account_id).first()
            return AccountFront._from_account(acc)
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while fetching account", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error fetching account by id", layer=ERRORS_LAYERS.DATABASE, ex=ex)



    def get_user_accounts(self, user_id : int ) -> list[AccountFront]:
        """Get user accountFront list"""
        try:
            accs = self.db.query(Account).filter(Account.user_id == user_id).all()
            return [AccountFront._from_account(acc) for acc in accs]
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while fetching user accounts", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error fetching user accounts", layer=ERRORS_LAYERS.DATABASE, ex=ex)


    def get_refresh_token(self, account_id: int, user_id : int) -> str:
        """Returns decrypted refresh token"""
        try:
            acc = self.db.query(Account).filter(Account.account_id == account_id).filter(Account.user_id == user_id).first()
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while fetching refresh token", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error fetching refresh token", layer=ERRORS_LAYERS.DATABASE, ex=ex)

        if not acc or not acc.refresh_token:
            raise ApplicationError(
                f"Account or refresh token not found for account_id: {account_id}",
                layer=ERRORS_LAYERS.DATABASE,
                details={"account_id": account_id}
            )
        return self.encrypter.decrypt(acc.refresh_token)


    def create(
        self,
        user_id: int,
        email_provider_id: str,
        email: str,
        refresh_token: str = None,
        provider_type: str = "EMAIL",
    ) -> AccountFront:
        """Create new account with encrypting refresh_token"""
        if refresh_token:
            refresh_token = self.encrypter.encrypt(refresh_token)

        #check if user_id and email_provider_id exists, otherwise raise applicationerror with layer Database

        account  = Account(
            user_id = user_id,
            provider_type=provider_type,
            email_provider_id=email_provider_id,
            email=email,
            refresh_token=refresh_token
        )
        try:
            self.db.add(account)
            self.db.commit()
            self.db.refresh(account)
            return AccountFront._from_account(account)
        except IntegrityError as ex:
            self.db.rollback()
            raise ApplicationError("Account already exists for this user and provider", layer=ERRORS_LAYERS.DATABASE, ex=ex)
        except OperationalError as ex:
            self.db.rollback()
            raise InfrastructureError("Database connection error while creating account", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            self.db.rollback()
            raise ApplicationError("Error creating account", layer=ERRORS_LAYERS.DATABASE, ex=ex)

    def update_refresh_token(self, account_id: int, new_token: str = None) -> AccountFront:
        """Update refresh token for account_id, encrypting the new one"""
        encrypted_token = self.encrypter.encrypt(new_token) if new_token else None
        try:
            account = self.db.query(Account).filter(Account.account_id == account_id).first()
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while fetching account for token update", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error fetching account for token update", layer=ERRORS_LAYERS.DATABASE, ex=ex)

        if not account:
            raise ApplicationError(
                f"Account not exists for refreshing token",
                layer=ERRORS_LAYERS.DATABASE,
                details={"account_id": account_id}
            )
        try:
            account.refresh_token = encrypted_token
            self.db.commit()
            self.db.refresh(account)
            return AccountFront._from_account(account)
        except OperationalError as ex:
            self.db.rollback()
            raise InfrastructureError("Database connection error while updating refresh token", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            self.db.rollback()
            raise ApplicationError("Error updating refresh token", layer=ERRORS_LAYERS.DATABASE, ex=ex)

    def delete_account(self, account_id: int) -> bool:
        """delete account by account_id"""
        try:
            acc = self.db.query(Account).filter(Account.account_id == account_id).first()
            if not acc:
                raise ApplicationError("Account not found for deletion", layer=ERRORS_LAYERS.DATABASE, details={"account_id": account_id})
            self.db.delete(acc)
            self.db.commit()
            return True
        except ApplicationError:
            raise
        except OperationalError as ex:
            self.db.rollback()
            raise InfrastructureError("Database connection error while deleting account", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            self.db.rollback()
            raise ApplicationError("Error deleting account", layer=ERRORS_LAYERS.DATABASE, ex=ex)
