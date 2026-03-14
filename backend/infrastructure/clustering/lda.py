from dataclasses import dataclass
from gensim.models import LdaModel
from gensim import corpora


from infrastructure.clustering._clusterer  import Clusterer
from infrastructure.utils.config_hash import hash_config
from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError

@dataclass
class LdaClustererConfig:
    k_clusters: int
    random_state: int=42
    passes:int=20
    alpha:str='auto'
    eta : str ='auto'


class LdaClusterer(Clusterer):
    def __init__(self, cfg : LdaClustererConfig):
        """k_clusters is required"""
        self.cfg = cfg

    def cluster(self, docs_tokens ) -> list[int]:
        """docs_tokens: List of lists(n_documents, n_tokens). Returns: List of labels with size n_documents, label[i] representing the number of topic """
        try:
            dictionary = corpora.Dictionary(docs_tokens)
            corpus = [dictionary.doc2bow(text) for text in docs_tokens]
            lda = LdaModel(
                corpus=corpus,
                id2word=dictionary,
                num_topics=self.cfg.k_clusters,
                random_state=self.cfg.random_state,
                passes=self.cfg.passes,
                alpha=self.cfg.alpha,
                eta=self.cfg.eta
            )

            doc_topic_numbers = []

            for doc_bow in corpus:
                doc_topics = lda.get_document_topics(doc_bow)
                top_topic = max(doc_topics, key=lambda x: x[1])[0]
                doc_topic_numbers.append(top_topic)

            return doc_topic_numbers

        except Exception as ex:
            raise InfrastructureError(
                f"Error clustering using: LdaClusterer clustering",
                layer=INFRA_ERROR_LAYERS.EMBEDDING,
                priority=2,
                ex=ex
            )

    def get_config_hash(self) -> str:
        return hash_config(self.cfg)

