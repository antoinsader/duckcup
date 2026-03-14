import httpx
import requests

from application.exceptions import ERRORS_LAYERS, ApplicationError
from infrastructure.storage.meta_files_repository import META_FILES, MetaFilesRepository



url = "https://huggingface.co/api/models"

def save_hf_prompt_models() -> None:
    params = {
        "filter": "text-generation",
        "sort": "downloads",
        "direction": "-1",
        "limit": 100
    }

    try:
        response =requests.get(url, params=params)
        models= response.json()

        cleaned = [
            {
                "id": m.get("id"),
                "downloads": m.get("downloads", 0),
            }
            for m in models
        ]
        repo = MetaFilesRepository(META_FILES.HUGGING_FACE_MODELS_META)
        repo.save_meta_file(cleaned)


    except Exception as e:
        raise ApplicationError(
            f"Error getting hugging face models and save them",
            ex=e,
            layer=ERRORS_LAYERS.META
        )

def get_hf_models_data() -> list[dict]:
    """ Get list of hugging face text generation models available for the user, Returns format [{id, downloads},...]"""

    params = {
        "pipeline_tag": "text-generation",
        "other": "conversational",
        "inference_provider": "all", 
        "sort": "downloads",
        "direction": -1,
        "limit": 50
    }
    try:
        response =requests.get(url, params=params)
        models= response.json()

        cleaned = [
            {
                "id": m.get("id"),
                "downloads": m.get("downloads", 0),
            }
            for m in models
        ]
        return cleaned
    except Exception as e:
        raise ApplicationError(
            f"Error getting hugging face models and save them",
            ex=e,
            layer=ERRORS_LAYERS.META
        )
