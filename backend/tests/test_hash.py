from infrastructure.utils.config_hash import hash_config
from infrastructure.cache.key_builders import build_cluster_title_cache_key




hash1 = hash_config({"a": 1, "b": 2})
hash2_1 = hash_config({"a": 1, "b": 2, "c": 3})
hash2_2 = hash_config({"a": 1, "b": 2, "c": 3})
hash3 = hash_config({"b": 2, "a": 1})

assert hash1 != hash2_1
assert hash2_1 == hash2_2
assert hash1 == hash3




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




print("All tests passed!")