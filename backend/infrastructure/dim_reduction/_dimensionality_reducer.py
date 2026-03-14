from abc import ABC

import numpy as np


class DimensionalityReducer(ABC):
    def embs(self, embs) -> np.ndarray:
        pass