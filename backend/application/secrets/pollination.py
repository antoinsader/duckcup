



import requests
from sqlalchemy.orm import Session

from api.core.config import settings
from application.exceptions import ERRORS_LAYERS, ApplicationError
from application.repositories.userKeysRepository import UserKeysRepositoryDb
from infrastructure.encryption.fernet import FernetEncrypter









def pollination_key_is_valid(key):
    """Check if the pollination key is valid. Return True if the key is valid, False otherwise."""
    try:
        headers = {"Authorization": f"Bearer {key}"}
        response = requests.get("https://gen.pollinations.ai/account/profile", headers=headers)
        if response.status_code == 200:
            return True
        return False
    except Exception as ex:
        raise ApplicationError(
            f"error checking validation of pollination key ",
            layer=ERRORS_LAYERS.APPLICATION_SECRETS,
            ex=ex
        )


def pollination_key_whoami(db: Session, user_id: int):
    """ Check if the user has a valid pollination key, and return the whoami information of the key {name, email, githubUsername, image, tier, createdAt, nextResetAt}, or None if the key is not valid or not set."""
    try:
        encryption_service = FernetEncrypter(settings.backend_secrets_encryption_key.get_secret_value())
        repo = UserKeysRepositoryDb(db, encryption_service)
        k = repo.get_user_key(key_name='pollination_key',  user_id=user_id)
        if not k:
            return None

        headers = {"Authorization": f"Bearer {k}"}
        response = requests.get("https://gen.pollinations.ai/account/profile", headers=headers)
        if response.status_code != 200:
            return None
        return response.json()
    except Exception as ex:
        raise ApplicationError(
            f"error checking if hugging face key is valid ",
            details={"user_id", user_id},
            layer=ERRORS_LAYERS.APPLICATION_SECRETS,
            ex=ex
        )
