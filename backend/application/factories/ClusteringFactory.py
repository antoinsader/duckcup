
# ***********************************************************************
# if you want to add a clustering strategy, do not forget to add it in clustering_algorithms
# ***********************************************************************

import hashlib
import json

from api.core.config import settings
from application.exceptions import ERRORS_LAYERS, ApplicationError
from domain.enums import clustering_algorithms
from infrastructure.clustering import KmeansClusterer, LdaClusterer, AdvancedClusterer, LdaClustererConfig
from infrastructure.clustering._clusterer import Clusterer
from infrastructure.clustering.hdbscan import HdbScanConfig
from infrastructure.embedding import OllamaEmbedder, OllamaEmbedderConfig
from infrastructure.embedding._embedder import Embedder, ollama_local_available
from infrastructure.tokenizer import SpacyTokenizer, SpacyTokenizerConfig
from infrastructure.dim_reduction import UmapReducerConfig
from infrastructure.tfidf_service import TfIdf_config, TfIdf_Service
from infrastructure.embedding.transformers import TransformersEmbedder, TransformersEmbedderConfig
from infrastructure.tokenizer.tokenizer import Tokenizer
from infrastructure.utils.config_hash import hash_config


class ClusteringStrategy:
    def __init__(self, clusterer: Clusterer, embedder: Embedder=None, tokenizer: Tokenizer=None, tfidf:TfIdf_Service=None):
        self.clusterer = clusterer
        self.embedder = embedder
        self.tokenizer = tokenizer
        self.tfidf = tfidf

    def get_strategy_hash(self) -> str:
        return hash_config(
            {
                "clusterer": self.clusterer.get_config_hash(),
                "embedder": self.embedder.get_config_hash() if self.embedder else None,
                "tokenizer": self.tokenizer.get_config_hash() if self.tokenizer else None,
                "tfidf": self.tfidf.get_config_hash() if self.tfidf else None,
            }
        )

def build_clustering_strategy(
    clustering_algorithm: str, 
    k_clusters=None, 
    embedder_type="sentence_transformers", 
    embedder_model="all-MiniLM-L6-v2") -> ClusteringStrategy:


    if clustering_algorithm == clustering_algorithms.TOKENS_KMEANS.value:
        tokenizer = SpacyTokenizer(SpacyTokenizerConfig())
        tfidf = TfIdf_Service(TfIdf_config())
        clusterer = KmeansClusterer(k_clusters)
        return ClusteringStrategy(clusterer, tokenizer=tokenizer, tfidf=tfidf)

    if clustering_algorithm == clustering_algorithms.SEMANTICS_KMEANS.value:
        if embedder_type == "ollama":
            embedder = OllamaEmbedder(OllamaEmbedderConfig(model=embedder_model))
            if not ollama_local_available():
                raise ApplicationError(
                    f"Ollama embedder selected but Ollama is not available on the host of {settings.ollama_host}",
                    only_back_message=f"Ollama embedder selected but Ollama is not available on the host of {settings.ollama_host}", 
                    layer=ERRORS_LAYERS.FACTORIES_CLUSTERING
                )
        else:
            embedder = TransformersEmbedder(TransformersEmbedderConfig(model=embedder_model))

        clusterer = KmeansClusterer(k_clusters)
        return ClusteringStrategy(clusterer, embedder=embedder)

    if clustering_algorithm == clustering_algorithms.LDA.value:
        tokenizer = SpacyTokenizer(SpacyTokenizerConfig())
        clusterer = LdaClusterer(LdaClustererConfig(k_clusters=k_clusters))
        return ClusteringStrategy(clusterer, tokenizer=tokenizer)

    if clustering_algorithm == clustering_algorithms.ADVANCED.value:
        if embedder_type == "ollama":
            embedder = OllamaEmbedder(OllamaEmbedderConfig(model=embedder_model))
            if not ollama_local_available():
                raise ApplicationError(
                    f"Ollama embedder selected but Ollama is not available on the host of {settings.ollama_host}",
                    only_back_message=f"Ollama embedder selected but Ollama is not available on the host of {settings.ollama_host}", 
                    layer=ERRORS_LAYERS.FACTORIES_CLUSTERING
                )
        else:
            embedder = TransformersEmbedder(TransformersEmbedderConfig(model=embedder_model))
        clusterer = AdvancedClusterer(umap_config=UmapReducerConfig(), hdbscan_config=HdbScanConfig())
        return ClusteringStrategy(clusterer, embedder=embedder)

    else:
        raise ApplicationError(
            "Error building clustering strategy",
            only_back_message=f"clustering algorithm: {clustering_algorithm} do not exists as clustering algorithms", 
            layer=ERRORS_LAYERS.FACTORIES_CLUSTERING
        )