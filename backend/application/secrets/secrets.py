

from sqlalchemy.orm import Session

from api.core.config import settings
from application.repositories.userKeysRepository import UserKeysRepositoryDb
from infrastructure.encryption.fernet import FernetEncrypter
from infrastructure.encryption.rsa import decrypt_rsa_value
from application.exceptions import ERRORS_LAYERS, ApplicationError


def set_user_key(db: Session, encrypted_front_key_value:str, user_id:int, key_name: str, validation_function) -> bool:
    """Decrypt key sent from front-end, check if key is valid, save it as a user key"""

    key_value  = decrypt_rsa_value(encrypted_front_key_value)
    pn_user = validation_function(key_value)
    if not pn_user:
        raise ApplicationError(
            f"{key_name} key is not valid",
            details={"user_id", user_id},
            layer=ERRORS_LAYERS.APPLICATION_SECRETS,
        )

    try:
        encryption_service = FernetEncrypter( settings.backend_secrets_encryption_key.get_secret_value())
        repo = UserKeysRepositoryDb(db, encryption_service)
        repo.save_user_key(key_name=key_name, key_value = key_value, user_id=user_id)
        return True
    except Exception as ex:
        raise ApplicationError(
            f"error setting pollination key ",
            details={"user_id", user_id},
            layer=ERRORS_LAYERS.APPLICATION_SECRETS,
            ex=ex
        )

def delete_user_key(db: Session, key_name: str, user_id: int) -> bool:
    try:
        encryption_service = FernetEncrypter( settings.backend_secrets_encryption_key.get_secret_value())
        repo = UserKeysRepositoryDb(db, encryption_service)
        repo.delete_user_key(key_name=key_name,  user_id=user_id)
    except Exception as ex:
        raise ApplicationError(
            f"error deleting pollination key ",
            details={"user_id", user_id},
            layer=ERRORS_LAYERS.APPLICATION_SECRETS,
            ex=ex
        )
