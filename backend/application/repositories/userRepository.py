

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, OperationalError
import random
import string

from domain.db_models.User import User_Front, User
from application.exceptions import ApplicationError, InfrastructureError, ERRORS_LAYERS, INFRA_ERROR_LAYERS
from passlib.context import CryptContext

class PasswordHasher:
    def __init__(self):
        self.pwd_context = CryptContext(
            schemes=["scrypt"], 
            deprecated="auto"
        )

    def hash(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def verify(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)



class UserAuthController:
    def __init__(self, db: Session):
        self.db = db 
        self.hasher = PasswordHasher()

    def get_by_usernamepassword(self, username, password):
        try:
            user = self.db.query(User).filter(User.username == username).first()
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while authenticating user", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error querying user for authentication", layer=ERRORS_LAYERS.DATABASE, ex=ex)
        if not user:
            return None
        if self.hasher.verify(password, user.password):
            return User_Front._from_user(user)
        return None
    def check_user_exists(self, username: str) -> bool:
        try:
            user = self.db.query(User).filter(User.username == username).first()
            return True if user else False
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while checking user existence", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error checking user existence", layer=ERRORS_LAYERS.DATABASE, ex=ex)

    def create_user(self, username, password):
        hashed_password = self.hasher.hash(password)
        db_user = User(username=username, password=hashed_password)
        try:
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            return User_Front._from_user(db_user)
        except IntegrityError as ex:
            self.db.rollback()
            raise ApplicationError("Username already exists", layer=ERRORS_LAYERS.DATABASE, ex=ex)
        except OperationalError as ex:
            self.db.rollback()
            raise InfrastructureError("Database connection error while creating user", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            self.db.rollback()
            raise ApplicationError("Error creating user", layer=ERRORS_LAYERS.DATABASE, ex=ex)

    def get_all_user(self) -> list[User_Front]:
        try:
            users = self.db.query(User).all()
            return [User_Front._from_user(user) for user in users]
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while fetching all users", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error fetching all users", layer=ERRORS_LAYERS.DATABASE, ex=ex)

    def delete_user(self, user_id: int):
        # ! to do: delete user datasets and accounts before deleting the user
        try:
            user = self.db.query(User).filter(User.user_id == user_id).first()
            if user:
                self.db.delete(user)
                self.db.commit()
                return True
            return False
        except OperationalError as ex:
            self.db.rollback()
            raise InfrastructureError("Database connection error while deleting user", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            self.db.rollback()
            raise ApplicationError("Error deleting user", layer=ERRORS_LAYERS.DATABASE, ex=ex)

class UserControllerDb:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id):
        try:
            user = self.db.query(User).filter(User.user_id == user_id).first()
            return User_Front._from_user(user)
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while fetching user by id", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error fetching user by id", layer=ERRORS_LAYERS.DATABASE, ex=ex)
