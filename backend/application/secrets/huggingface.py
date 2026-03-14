

import os
from sqlalchemy.orm import Session
import requests


from api.core.config import settings
from application.exceptions import ERRORS_LAYERS, ApplicationError
from application.repositories.userKeysRepository import UserKeysRepositoryDb
from infrastructure.encryption.fernet import FernetEncrypter




def hugging_face_key_is_valid(key : str) -> bool:
    """Check if the hugging face key is valid. Return True if the key is valid, False otherwise."""
    try:
        headers = {"Authorization": f"Bearer {key}"}
        response = requests.get("https://huggingface.co/api/whoami-v2", headers=headers)
        if response.status_code == 200:
            return True
        return False
    except Exception as ex:
        raise ApplicationError(
            f"error checking validation of hugging  face ",
            layer=ERRORS_LAYERS.APPLICATION_SECRETS,
            ex=ex
        )


def hugging_face_key_whoami(db: Session, user_id: int) -> dict:
    """ Check if the user has a valid hugging face key, and return the whoami information of the key {name, fullname, token_name}, or None if the key is not valid or not set."""
    try:
        encryption_service = FernetEncrypter(settings.backend_secrets_encryption_key.get_secret_value())
        repo = UserKeysRepositoryDb(db, encryption_service)
        k = repo.get_user_key(key_name='hugging_face_key',  user_id=user_id)
        if not k:
            return None

        headers = {"Authorization": f"Bearer {k}"}
        response = requests.get("https://huggingface.co/api/whoami-v2", headers=headers)
        if response.status_code != 200:
            return None
        data= response.json()
        token_name = ""
        if data['auth'] is not None and data['auth']['accessToken'] is not None and  data['auth']['accessToken']['displayName'] is not None:
            token_name = data['auth']['accessToken']['displayName']
        return {
            "name": data['name'],
            "fullname": data['fullname'],
            "token_name": token_name
        } 
    except Exception as ex:
        raise ApplicationError(
            f"error checking if hugging face key is valid ",
            details={"user_id", user_id},
            layer=ERRORS_LAYERS.APPLICATION_SECRETS,
            ex=ex
        )
