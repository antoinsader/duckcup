from infrastructure.utils.config_hash import hash_config
from infrastructure.cache.key_builders import (
    build_cluster_title_cache_key,
    build_cluster_documents_cache_key,
    build_summarize_documents_cache_key,
)


def test_hash_config():

    hash1 = hash_config({"a": 1, "b": 2})
    hash2_1 = hash_config({"a": 1, "b": 2, "c": 3})
    hash2_2 = hash_config({"a": 1, "b": 2, "c": 3})
    hash3 = hash_config({"b": 2, "a": 1})

    assert hash1 != hash2_1
    assert hash2_1 == hash2_2
    assert hash1 == hash3




def test_build_cluster_title_cache_key():
    account_id = 1
    cluster_docs_ids_1 = ["doc1", "doc2", "doc3"]
    cluster_docs_ids_2 = ["doc2", "doc1", "doc3"]
    cluster_docs_ids_3 = ["doc1", "doc3", "doc2"]
    cluster_docs_ids_4 = ["doc1", "doc2", "doc3"]
    cluster_docs_ids_5 = ["doc2", "doc0", "doc3"]
    build_cluster_title_cache_key_1 = build_cluster_title_cache_key(account_id, cluster_docs_ids_1)
    build_cluster_title_cache_key_2 = build_cluster_title_cache_key(account_id, cluster_docs_ids_2)
    build_cluster_title_cache_key_3 = build_cluster_title_cache_key(account_id, cluster_docs_ids_3)
    build_cluster_title_cache_key_4 = build_cluster_title_cache_key(account_id, cluster_docs_ids_4)
    build_cluster_title_cache_key_5 = build_cluster_title_cache_key(account_id, cluster_docs_ids_5)

    assert build_cluster_title_cache_key_1 == build_cluster_title_cache_key_2, f"Expected {build_cluster_title_cache_key_1} to equal {build_cluster_title_cache_key_2}"
    assert build_cluster_title_cache_key_1 == build_cluster_title_cache_key_3
    assert build_cluster_title_cache_key_1 == build_cluster_title_cache_key_4
    assert build_cluster_title_cache_key_1 != build_cluster_title_cache_key_5


def test_build_cluster_documents_cache_key():
    dataset_id = 1
    strategy_hash = "abc123"
    ids_1 = ["doc1", "doc2", "doc3"]
    ids_2 = ["doc2", "doc1", "doc3"]
    ids_3 = ["doc3", "doc1", "doc2"]
    ids_4 = ["doc1", "doc2", "doc3"]
    ids_5 = ["doc1", "doc2", "doc99"]

    key_1 = build_cluster_documents_cache_key(dataset_id, strategy_hash, ids_1)
    key_2 = build_cluster_documents_cache_key(dataset_id, strategy_hash, ids_2)
    key_3 = build_cluster_documents_cache_key(dataset_id, strategy_hash, ids_3)
    key_4 = build_cluster_documents_cache_key(dataset_id, strategy_hash, ids_4)
    key_5 = build_cluster_documents_cache_key(dataset_id, strategy_hash, ids_5)
    key_other_strategy = build_cluster_documents_cache_key(dataset_id, "different_hash", ids_1)
    key_other_dataset = build_cluster_documents_cache_key(2, strategy_hash, ids_1)

    assert key_1 == key_2, f"Expected {key_1} to equal {key_2}"
    assert key_1 == key_3
    assert key_1 == key_4
    assert key_1 != key_5
    assert key_1 != key_other_strategy
    assert key_1 != key_other_dataset


def test_build_summarize_documents_cache_key():
    dataset_id = 1
    ids_1 = ["doc1", "doc2", "doc3"]
    ids_2 = ["doc2", "doc1", "doc3"]
    ids_3 = ["doc3", "doc1", "doc2"]
    ids_4 = ["doc1", "doc2", "doc3"]
    ids_5 = ["doc1", "doc2", "doc99"]
    provider = "openai"
    model = "gpt-4"

    key_1 = build_summarize_documents_cache_key(dataset_id, ids_1, provider, model)
    key_2 = build_summarize_documents_cache_key(dataset_id, ids_2, provider, model)
    key_3 = build_summarize_documents_cache_key(dataset_id, ids_3, provider, model)
    key_4 = build_summarize_documents_cache_key(dataset_id, ids_4, provider, model)
    key_5 = build_summarize_documents_cache_key(dataset_id, ids_5, provider, model)
    key_other_provider = build_summarize_documents_cache_key(dataset_id, ids_1, "anthropic", model)
    key_other_model = build_summarize_documents_cache_key(dataset_id, ids_1, provider, "gpt-3.5")
    key_other_dataset = build_summarize_documents_cache_key(2, ids_1, provider, model)

    assert key_1 == key_2, f"Expected {key_1} to equal {key_2}"
    assert key_1 == key_3
    assert key_1 == key_4
    assert key_1 != key_5
    assert key_1 != key_other_provider
    assert key_1 != key_other_model
    assert key_1 != key_other_dataset




print("All tests passed!")