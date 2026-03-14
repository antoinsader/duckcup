import hashlib


def build_cluster_title_cache_key(
    dataset_id: int,
    cluster_docs_ids: list[str],
) -> str:
    normalized_ids = tuple(sorted(str(doc_id) for doc_id in cluster_docs_ids))
    raw_key = f"cluster_title|dataset_id={dataset_id}|cluster_docs_ids={','.join(normalized_ids)}"
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def build_cluster_documents_cache_key(
    dataset_id: int,
    strategy_hash: str,
    cluster_documents_ids: list[str] | list[int],
):
    normalized_ids = tuple(sorted(str(doc_id) for doc_id in cluster_documents_ids))
    raw_key = f"cluster_docs|dataset_id={dataset_id}|strategy_hash={strategy_hash}|cluster_docs_ids={','.join(normalized_ids)}"
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def build_summarize_documents_cache_key(
    dataset_id: int,
    cluster_docs_ids: list[str] | list[int],
    provider: str,
    model: str
):
    normalized_ids = tuple(sorted(str(doc_id) for doc_id in cluster_docs_ids))
    raw_key = f"summarize_docs|dataset_id={dataset_id}|provider={provider}|model={model}|cluster_docs_ids={','.join(normalized_ids)}"
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
