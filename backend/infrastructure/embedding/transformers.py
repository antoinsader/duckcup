from dataclasses import dataclass
from sentence_transformers import SentenceTransformer

from application.exceptions import ERRORS_LAYERS, INFRA_ERROR_LAYERS, ApplicationError, InfrastructureError
from infrastructure.utils.config_hash import hash_config

from ._embedder import Embedder

from api.core.config import settings

@dataclass
class TransformersEmbedderConfig:
    batch_size : int= 16
    normalize_embeddings : bool = True
    model:str = settings.default_st_embedding_model

class TransformersEmbedder(Embedder):
    def __init__(self, cfg:TransformersEmbedderConfig):
        """Raises INFRA error if model is not working for embedding."""
        self.cfg:TransformersEmbedderConfig = cfg
        try:
            if self.cfg.model == "":
                self.cfg.model = settings.default_st_embedding_model
            self.model = SentenceTransformer(self.cfg.model)
            tst = self.model.encode("test")
        except Exception as ex:
            raise InfrastructureError(
                f"Error initiating transformer embedder, are you sure model name is valid?",
                details={"model": self.cfg.model, "embedder": "transformers"},
                layer=INFRA_ERROR_LAYERS.EMBEDDING,
                ex=ex,
            )


    def embed(self, texts):
        try:
            embs =  self.model.encode(
                texts,
                batch_size= self.cfg.batch_size,
                normalize_embeddings=self.cfg.normalize_embeddings
            )
            return embs
        except Exception as ex:
            raise InfrastructureError(
                f"Transformers embedding failed",
                details={"model": self.cfg.model, "embedder": "transformers"},
                layer=INFRA_ERROR_LAYERS.EMBEDDING,
                ex=ex,
            )

    def get_config_hash(self) -> str:
        return hash_config(self.cfg)
