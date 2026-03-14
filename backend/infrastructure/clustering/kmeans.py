
from sklearn.cluster import KMeans

from infrastructure.clustering._clusterer  import Clusterer
from infrastructure.utils.config_hash import hash_config

from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError



class KmeansClusterer(Clusterer):
    def __init__(self, k_clusters):
        """k_clusters is required"""

        self.k_clusters = k_clusters
    def cluster(self, inp ) -> list[int]:
        """inp: could be tfidf matrix or embeddings. Returns: labels where len(labels) = len(tfidf_matrix), label[i] = num_cluster that i document belongs to"""

        try:
            kmeans = KMeans(
                n_clusters=self.k_clusters,
                random_state=42,
                n_init="auto"
            )
            labels = kmeans.fit_predict(inp)
            return labels
        except Exception as ex:
            raise InfrastructureError(
                f"Error clustering using: KMeans clustering",
                layer=INFRA_ERROR_LAYERS.EMBEDDING,
                priority=2,
                ex=ex
            )

    def get_config_hash(self) -> str:
        return hash_config({"k_clusters": self.k_clusters})
