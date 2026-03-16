
from fastapi import APIRouter

from application.get_meta.huggingface import get_hf_models_data
from application.get_meta.pollinations import get_pollinations_models_data
from application.login_providers.login_provider import LoginProviderFront, ProvidersCatalog

from infrastructure.embedding._embedder import get_embedders_types


router = APIRouter()



@router.get("/login_providers")
def get_login_providers() -> list[LoginProviderFront]:
    """List the login providers supported by the application.

    Authentication:
        Not required.

    Request Body:
        None.

    Returns:
        items: list[LoginProviderFront] - Provider entries with id/name/label fields used by the frontend login chooser.
    """
    providers_catalog = ProvidersCatalog()
    return providers_catalog.get_providers_front()



@router.get("/hugging_face_text_models")
def get_hugging_face_text_models() -> list[dict]:
    """List available Hugging Face text-generation models.

    Authentication:
        Not required.

    Request Body:
        None.

    Returns:
        items: list[dict] - Model rows, typically including id: str and downloads: int.
    """
    return get_hf_models_data()


@router.get("/pollination_text_models")
def get_pollination_text_models() -> list[dict]:
    """List available Pollinations text-generation models.

    Authentication:
        Not required.

    Request Body:
        None.

    Returns:
        items: list[dict] - Model rows, typically including name: str and pricing metadata.
    """
    return get_pollinations_models_data()


@router.get("/embedders_types")
def get_embedders() -> dict:
    """List the embedding providers available to the application.

    Authentication:
        Not required.

    Request Body:
        None.

    Returns:
        items: list[dict] - Embedder definitions including id, label, description, availability, default model, and external model source links.
    """
    return get_embedders_types()