from abc import ABC, abstractmethod




class Clusterer(ABC):
    @abstractmethod
    def cluster(self, X) -> list[int]:
        """
            Returns:
                labels where len(labels) = len(tfidf_matrix)
                label[i] = num_cluster that i document belongs to

        """
        pass

    @abstractmethod
    def get_config_hash(self) -> str:
        pass
