from dataclasses import dataclass
from ollama import Client
import numpy as np
import requests

from application.exceptions import  INFRA_ERROR_LAYERS, InfrastructureError
from infrastructure.utils.config_hash import hash_config
from ._embedder import Embedder 

from api.core.config import settings






@dataclass
class OllamaEmbedderConfig:
    """Model to be used for embedding with ollama"""
    model:str=settings.default_ollama_embedding_model
    normalize: bool = True

class OllamaEmbedder(Embedder):
    def __init__(self, cfg:OllamaEmbedderConfig, model_cache: dict = None):
        """Requires ollama to be downloaded on the server. providing the host in the .env file."""
        self.cfg = cfg
        self.host = settings.ollama_host
        self.client = Client(host=self.host)
        self.cache = model_cache or {}

    def _make_cache_key(self, texts):
        if isinstance(texts, str):
            normalized_texts = (texts.strip().lower(),)
        else:
            normalized_texts = tuple(str(text).strip().lower() for text in texts)
        return (self.host, self.cfg.model, normalized_texts)

    def embed(self, texts):
        try:
            cache_key = self._make_cache_key(texts)
            if cache_key in self.cache:
                return self.cache[cache_key]
            res = self.client.embed(
                    model=self.cfg.model,
                    input=texts,
                )
            embs = np.array(res["embeddings"], dtype=float)
            if self.cfg.normalize:
                norms = np.linalg.norm(embs, axis=1, keepdims=True) + 1e-12
                embs = embs / norms
            self.cache[cache_key] = embs
            return embs
        except Exception as ex:
            raise InfrastructureError(
                    f"Ollama embed failed", 
                    layer=INFRA_ERROR_LAYERS.EMBEDDING,
                    ex=ex,
                    details={"model": self.cfg.model, "embedder": "ollama"},
                )

    def get_config_hash(self) -> str:
        return hash_config({"cfg": self.cfg})
