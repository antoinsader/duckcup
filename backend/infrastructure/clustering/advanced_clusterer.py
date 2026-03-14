

from infrastructure.clustering.hdbscan import HdbScanConfig, HdbScanClusterer
from infrastructure.embedding.transformers import TransformersEmbedder
from infrastructure.dim_reduction.umap import UmapReducer, UmapReducerConfig

from infrastructure.clustering._clusterer import Clusterer
from infrastructure.utils.config_hash import hash_config
from application.exceptions import InfrastructureError, INFRA_ERROR_LAYERS

class AdvancedClusterer(Clusterer):
    def __init__(self, umap_config : UmapReducerConfig, hdbscan_config:HdbScanConfig, normalize=True ):
        self.umap_config = umap_config
        self.hdbscan_config = hdbscan_config
        self.normalize = normalize

    def cluster(self, embs):
        """Embedding --> umap d reduction --> cluster using hdbscan, Returns cluster labels: 1d numpy int array, a number representing the cluster for each text"""

        try:
            umap_ser = UmapReducer(self.umap_config)
            embs_umap = umap_ser.reduce(embs)


            cluster_ser = HdbScanClusterer(self.hdbscan_config)
            clusters_labels = cluster_ser.cluster(embs_umap)

            return clusters_labels
        except Exception as ex:
            raise InfrastructureError(
                f"Error clustering using: advanced clustering",
                layer=INFRA_ERROR_LAYERS.EMBEDDING,
                priority=2,
                ex=ex
            )

    def get_config_hash(self) -> str:
        return hash_config(
            {
                "umap_config": self.umap_config,
                "hdbscan_config": self.hdbscan_config,
                "normalize": self.normalize,
            }
        )
