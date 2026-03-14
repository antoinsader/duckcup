

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, OperationalError

from domain import UserKeys
from infrastructure.encryption._encrypter import Encrypter
from application.exceptions import ApplicationError, InfrastructureError, ERRORS_LAYERS, INFRA_ERROR_LAYERS


class UserKeysRepositoryDb:
    def __init__(self, db: Session, encryption_service:Encrypter):
        self.db = db
        self.enc = encryption_service

    def get_user_key(self, key_name: str, user_id: int):
        try:
            key_row = self.db.query(UserKeys).filter(UserKeys.user_id == user_id).filter(UserKeys.key_name == key_name).first()
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while fetching user key", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error fetching user key", layer=ERRORS_LAYERS.DATABASE, ex=ex)
        if not key_row:
            return None
        return self.enc.decrypt(key_row.key_value_encrypted)

    def save_user_key(self, key_name: str, key_value: str, user_id: int):
        encrypted_key = self.enc.encrypt(key_value)
        try:
            key_row = self.db.query(UserKeys).filter(UserKeys.user_id == user_id).filter(UserKeys.key_name == key_name).first()
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while fetching key for save", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error fetching key for save", layer=ERRORS_LAYERS.DATABASE, ex=ex)
        if key_row:
            key_row.key_value_encrypted = encrypted_key
        else:
            key_row = UserKeys(
                key_name=key_name,
                key_value_encrypted=encrypted_key,
                user_id=user_id,
            )
        try:
            self.db.add(key_row)
            self.db.commit()
            self.db.refresh(key_row)
            return key_row
        except IntegrityError as ex:
            self.db.rollback()
            raise ApplicationError("Key already exists for this user", layer=ERRORS_LAYERS.DATABASE, ex=ex)
        except OperationalError as ex:
            self.db.rollback()
            raise InfrastructureError("Database connection error while saving user key", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            self.db.rollback()
            raise ApplicationError("Error saving user key", layer=ERRORS_LAYERS.DATABASE, ex=ex)

    def delete_user_key(self, user_id:int, key_name: str):
        try:
            key_row = self.db.query(UserKeys).filter(UserKeys.user_id == user_id).filter(UserKeys.key_name == key_name).first()
            if not key_row:
                raise ApplicationError("Key not found for deletion", layer=ERRORS_LAYERS.DATABASE, details={"user_id": user_id, "key_name": key_name})
            self.db.delete(key_row)
            self.db.commit()
            return "success"
        except ApplicationError:
            raise
        except OperationalError as ex:
            self.db.rollback()
            raise InfrastructureError("Database connection error while deleting user key", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            self.db.rollback()
            raise ApplicationError("Error deleting user key", layer=ERRORS_LAYERS.DATABASE, ex=ex)
