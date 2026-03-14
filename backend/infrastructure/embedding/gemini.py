
from dataclasses import dataclass
import numpy as np
from google import genai
from google.genai import types



from application.exceptions import ERRORS_LAYERS, INFRA_ERROR_LAYERS, ApplicationError, InfrastructureError
from infrastructure.utils.config_hash import hash_config
from ._embedder import Embedder

@dataclass
class GeminiEmbedderConfig:
    model : str = "gemini-embedding-001"
    normalize: bool = True
    batch_size:int = 50
    embedding_task_type: str="SEMANTIC_SIMILARITY" 

class GeminiEmbedder(Embedder):
    def __init__(self, cfg:GeminiEmbedderConfig, gemini_api_key:str):
        self.cfg = cfg
        self.gemini_api_key = gemini_api_key

    def embed(self, texts):
        try:
            # is it normalized?
            texts = texts

            client = genai.Client(api_key=self.gemini_API_key)
            N = len(texts)
            batch_size = self.cfg.batch_size
            all_res = []
            for start in range(0, N, batch_size):
                end = min(start+batch_size, N)
                batch = texts[start:end]

                result = client.models.embed_content(
                    model=self.cfg.model,
                    contents=batch,
                    config=types.EmbedContentConfig(task_type=self.cfg.embedding_task_type)
                )
                all_res.extend(result.embeddings)
            embeddings_list = np.array([emb.values for emb in all_res])
            return embeddings_list
        except Exception as ex:
            raise InfrastructureError(
                f"Gemini embedding failed",
                details={"model": self.model, "embedder": "gemini"},
                layer=INFRA_ERROR_LAYERS.EMBEDDING,
                ex=ex,
            )

    def get_config_hash(self) -> str:
        return hash_config(self.cfg)
