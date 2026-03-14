from api.core.config import settings

from api.core.db import create_db_engine, create_session_factory
from application.factories.ClusteringFactory import ClusteringStrategy, build_clustering_strategy
from application.factories.DatasetFactory import get_current_dataset
from domain.enums import clustering_algorithms
from infrastructure.cache.cache_store import InMemoryLruCache
from infrastructure.cache.key_builders import build_cluster_documents_cache_key, build_cluster_title_cache_key

_cluster_title_cache = InMemoryLruCache(max_size=256)
_cluster_documents_cache = InMemoryLruCache(max_size=512)

def generate_title_cache(cluster_docs_ids):
    engine = create_db_engine(settings.database_url)
    sessionLocale = create_session_factory(engine)
    db = sessionLocale()

    dataset_id = 4
    user_id = 1
    current_ds = get_current_dataset(db, user_id =user_id, dataset_id=dataset_id)
    ds_content = current_ds.get("content")
    text_attribute = current_ds.get("text_attribute")
    id_attribute = current_ds.get("id_attribute")
    cluster_texts = [doc[text_attribute] for doc in ds_content if doc[id_attribute] in cluster_docs_ids]

    cluster_text = " ".join(cluster_texts)
    cache_key = build_cluster_title_cache_key(
        dataset_id=dataset_id,
        cluster_docs_ids=cluster_docs_ids,
    )
    cached = _cluster_title_cache.get(cache_key)
    if cached is not None:
        print(f"Title from cache: {cached}")
        return cached


    title = "HELLO TITLE"
    _cluster_title_cache.set(cache_key, title)
    print(f"title: {title}")



def test_cluster_title_cache():
    cluster_docs_ids = [36885,36884, 36883, 36882,36881, 36880  ]

    generate_title_cache(cluster_docs_ids)
    generate_title_cache(cluster_docs_ids)
    cluster_docs_ids_2 = [36885,36884, 36883, 36882,36881]
    generate_title_cache(cluster_docs_ids_2)
    generate_title_cache(cluster_docs_ids)



def test_cluster_documents_cache(documents_ids, clustering_algorithm, embedder_type, embedder_model):

    dataset_id = 4

    strategy : ClusteringStrategy = build_clustering_strategy(
        clustering_algorithm,
        5,
        embedder_type="sentence_transformers",
        embedder_model=embedder_model,
    )
    strategy_hash = strategy.get_strategy_hash()
    cache_key = build_cluster_documents_cache_key(
        dataset_id=dataset_id,
        strategy_hash=strategy_hash,
        cluster_documents_ids=documents_ids
    )

    cached = _cluster_documents_cache.get(cache_key)
    if cached is not None:
        print(f"Documents from cache: {cached}")
        return cache_key, True


    res = [
        1,2,3,4,5
    ]
    _cluster_documents_cache.set(cache_key, res)
    print(f"Documents saved: {res}")
    return cache_key, False

def test_cluster_documents_cache_main():
    cluster_docs_ids = [36885,36884, 36883, 36882,36881, 36880  ]
    cluster_docs_ids_2 = [36885,36884, 36883, 36882,36881]
    clustering_algorithm_1 = clustering_algorithms.ADVANCED.value
    clustering_algorithm_2 = clustering_algorithms.LDA.value
    embedder_model_1 = "all-MiniLM-L6-v2"
    embedder_model_2 = "all-MiniLM-L6-v1"

    res_1, from_cache_1 =  test_cluster_documents_cache(cluster_docs_ids, clustering_algorithm_1, "sentence_transformers", embedder_model_1)
    res_2, from_cache_2 = test_cluster_documents_cache(cluster_docs_ids, clustering_algorithm_1, "sentence_transformers", embedder_model_1)
    
    assert res_1 == res_2
    assert from_cache_1 == False
    assert from_cache_2 == True


    res_3, from_cache_3 = test_cluster_documents_cache(cluster_docs_ids_2, clustering_algorithm_1, "sentence_transformers", embedder_model_1)
    res_4, from_cache_4 = test_cluster_documents_cache(cluster_docs_ids_2, clustering_algorithm_1, "sentence_transformers", embedder_model_1)
    assert res_3 == res_4
    assert from_cache_3 == False
    assert from_cache_4 == True


    res_5, from_cache_5 = test_cluster_documents_cache(cluster_docs_ids_2, clustering_algorithm_1, "sentence_transformers", embedder_model_2)
    res_6, from_cache_6 = test_cluster_documents_cache(cluster_docs_ids_2, clustering_algorithm_2, "sentence_transformers", embedder_model_2)
    assert res_5 != res_6
    assert from_cache_5 == False
    assert from_cache_6 == False
