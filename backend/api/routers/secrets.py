from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session


from api.core.dependencies import get_current_user, get_db

from application.secrets.huggingface import  hugging_face_key_is_valid, hugging_face_key_whoami
from application.secrets.pollination import  pollination_key_is_valid, pollination_key_whoami
from application.secrets.secrets import set_user_key, delete_user_key
from domain.domain_models.Requests import AppKey
from domain.db_models import User
from infrastructure.encryption.rsa import get_rsa_public_key



router = APIRouter()




@router.post("/save_pollination_key")
def save_pollination_key( key_payload: AppKey, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Validate and store the current user's Pollinations API key.

    Authentication:
        Required.

    Request Body:
        encrypted_key: str - Client-encrypted provider key payload.

    Returns:
        success: bool - True when the key is valid and persisted.
    """

    success = set_user_key(
        db=db,
        encrypted_front_key_value=key_payload.encrypted_key,
        user_id=current_user.user_id,
        key_name='pollination_key',
        validation_function=pollination_key_is_valid,
    )
    return { "success": success}


@router.post("/save_huggingface_key")
def save_huggingface_key(key_payload: AppKey, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Validate and store the current user's Hugging Face API key.

    Authentication:
        Required.

    Request Body:
        encrypted_key: str - Client-encrypted provider key payload.

    Returns:
        success: bool - True when the key is valid and persisted.
    """
    success = set_user_key(
        db=db,
        encrypted_front_key_value=key_payload.encrypted_key,
        user_id=current_user.user_id,
        key_name='hugging_face_key',
        validation_function=hugging_face_key_is_valid,
    )
    return { "success": success}


@router.post("/get_saved_keys")
def get_saved_keys(current_user: User=Depends(get_current_user), db:Session=Depends(get_db)):
    """Return metadata about the currently saved external API keys.

    Authentication:
        Required.

    Request Body:
        None.

    Returns:
        hf_user: dict | None - Hugging Face account metadata if key is valid.
        pollination_user: dict | None - Pollinations account metadata if key is valid.
    """
    hf_user = hugging_face_key_whoami(db, current_user.user_id)
    pollination_user = pollination_key_whoami(db, current_user.user_id)
    return {"hf_user": hf_user, "pollination_user": pollination_user}


@router.get("/get_rsa_public_key")
def get_rsa_public_key_route(current_user: User=Depends(get_current_user)):
    """Return the RSA public key used to encrypt secrets on the client.

    Authentication:
        Required.

    Request Body:
        None.

    Returns:
        public_key: str - RSA public key used for frontend encryption.
    """
    if current_user.user_id is not None:
        return get_rsa_public_key()
    return {}



@router.post("/delete_huggingface_key")
def delete_huggingface_key_route(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Delete the saved Hugging Face API key for the current user.

    Authentication:
        Required.

    Request Body:
        None.

    Returns:
        success: bool - True when key deletion succeeds.
    """
    success = delete_user_key(db, key_name='hugging_face_key', user_id = current_user.user_id)
    return {"success": success}

@router.post("/delete_pollination_key")
def delete_pollination_key_route(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Delete the saved Pollinations API key for the current user.

    Authentication:
        Required.

    Request Body:
        None.

    Returns:
        success: bool - True when key deletion succeeds.
    """
    success = delete_user_key(db, key_name='pollination_key', user_id = current_user.user_id)
    return {"success": success}
