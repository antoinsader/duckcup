import requests
import numpy as np
from abc import ABC, abstractmethod

from api.core.config import settings

class Embedder(ABC):

    @abstractmethod
    def embed(self, texts:list[str]) -> np.ndarray:
        pass

    @abstractmethod
    def get_config_hash(self) -> str:
        pass





def ollama_local_available():
    try:
        response = requests.get(f"{settings.ollama_host}/api/tags", timeout=10000)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

def get_embedders_types():
     return {
        "embedders_types": [
            {
                "id": "sentence_transformers",
                "label": "Sentence Transformers",
                "description": "Embeddings from local Hugging Face Sentence Transformers models",
                "is_available": True,
                "is_default": True,
                "default_model": settings.default_st_embedding_model,
                "external_models_url": "https://huggingface.co/models?pipeline_tag=sentence-similarity&sort=trending",
            },
            {
                "id": "ollama",
                "label": "Ollama",
                "description": "Embeddings from local Ollama models",
                "is_available": ollama_local_available(),
                "is_default": False,
                "default_model": settings.default_ollama_embedding_model,
                "external_models_url": "https://ollama.com/search?c=embedding",
            }
        ]
    }
