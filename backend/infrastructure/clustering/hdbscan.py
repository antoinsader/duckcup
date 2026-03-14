
from dataclasses import dataclass
import hdbscan

from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError
from infrastructure.clustering._clusterer  import Clusterer
from infrastructure.utils.config_hash import hash_config


@dataclass
class HdbScanConfig:
    min_cluster_size : int = 10
    min_samples=10
    metric="euclidean"
    cluster_selection_method="eom"

class HdbScanClusterer(Clusterer):
    def __init__(self, cfg: HdbScanConfig  ):
        """
            config:
                min_cluster_size: smallest number of points to make a cluster
                min_samples: how conservative the clustering is, bigger would lead to more noise
                metric: how to calculate distances ["eucledean", "cosine"]
                cluster_selection_method
        """

        self.cfg :HdbScanConfig = cfg

    def cluster(self, embs) -> list[int]:
        """Clustering without k required. Returns: 1d numpy array with size of documents (embs), for each document, a label"""

        try:
            clusters = hdbscan.HDBSCAN(
                min_cluster_size =self.cfg.min_cluster_size,
                min_samples=self.cfg.min_samples,
                metric=self.cfg.metric,
                cluster_selection_method=self.cfg.cluster_selection_method
            )
            return clusters.fit_predict(embs)

        except Exception as ex:
            raise InfrastructureError(
                f"Error clustering using: hdbscan clustering",
                layer=INFRA_ERROR_LAYERS.EMBEDDING,
                priority=2,
                ex=ex
            )

    def get_config_hash(self) -> str:
        return hash_config(self.cfg)

