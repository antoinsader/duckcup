import umap
from dataclasses import dataclass

from infrastructure.dim_reduction._dimensionality_reducer  import DimensionalityReducer
from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError

@dataclass
class UmapReducerConfig:
    metric:str="euclidean"
    n_neighbors:int=25
    min_dist : float= 0.05
    n_components: int= 5
    random_state: int= 42

class UmapReducer(DimensionalityReducer):
    def __init__(self, cfg: UmapReducerConfig  ):
        """
            n_components: number of new dimension
            metric, n_neighbors, min_dist: umap arguments
        """
        self.cfg = cfg
    def reduce(self, embs):
        """
            args:
                embs: embeddings where the dimension to be reduced
            Returns:
                numpy array with shape (n_samples, n_components).
                Reduced dimensionality embedding
        """
        try:
            umap_model = umap.UMAP(
                n_neighbors=self.cfg.n_neighbors,
                min_dist=self.cfg.min_dist,
                n_components=self.cfg.n_components,
                metric=self.cfg.metric,
                random_state=self.cfg.random_state
            )
            return umap_model.fit_transform(embs)
        except Exception as ex:
            raise InfrastructureError(
                f"Error dimentionality reduction using: UMAP",
                layer=INFRA_ERROR_LAYERS.DIM_REDUCTION,
                priority=2,
                ex=ex
            )
