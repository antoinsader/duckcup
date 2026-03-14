from application.prompts import cluster_title
from infrastructure.cache.cache_store import InMemoryLruCache
from sqlalchemy.orm import Session
import numpy as np

from infrastructure.utils.messages_utils import get_top_senders
from infrastructure.tfidf_service import generate_title_tfidf

from application.factories.ClusteringFactory import ClusteringStrategy, build_clustering_strategy
from application.factories.DatasetFactory import get_current_dataset

from application.use_cases.emails_analysis import _cluster_title_cache

from infrastructure.cache.key_builders import build_cluster_documents_cache_key, build_cluster_title_cache_key

_cluster_all_documents_cache = InMemoryLruCache(max_size=512)
_cluster_sender_documents_cache = InMemoryLruCache(max_size=512)


def _cluster_documents(
    documents: list[dict],
    strategy: ClusteringStrategy,
    dataset_id: int,
    content_attribute='content_clean',
    subject_attribute='subject',
    id_attribute='id',
):
    
    docs_texts = [m[content_attribute] for m in documents]
    cleaned_texts = docs_texts
    data_flow = cleaned_texts
    if strategy.tokenizer is not None:
        data_flow = strategy.tokenizer.tokenize(data_flow)
    if strategy.embedder is not None:
        data_flow = strategy.embedder.embed(data_flow)
    if strategy.tfidf is not None:
        data_flow = strategy.tfidf.fit_transform(data_flow)

    clusters = strategy.clusterer.cluster(data_flow)
    clusters_ids = np.unique(clusters)

    all_mails_subjects = [m[subject_attribute] for m in documents if m[subject_attribute] is not None]
    final_clusters = []

    for cluster_id in clusters_ids:
        cluster_emails = [
            d for idx, d in enumerate(documents) if clusters[idx] == cluster_id
        ]
        cluster_subjects = [
            d[subject_attribute] for d in cluster_emails if d[subject_attribute] is not None
        ]

        cluster_ids = [
            d[id_attribute] for d in cluster_emails
        ]

        cache_key = build_cluster_title_cache_key(dataset_id, cluster_ids)
        _cached_title = _cluster_title_cache.get(cache_key)
        if _cached_title is not None and _cached_title['title'] is not None:
            cluster_title = _cached_title['title']
        elif len(all_mails_subjects) > 0 and len(cluster_subjects) > 0:
            cluster_title = generate_title_tfidf(all_mails_subjects, cluster_subjects, max_tokens=5)
        else:
            cluster_title = f"Cluster {cluster_id + 1}"

        final_clusters.append({
            "title": cluster_title,
            "docs": cluster_emails
        })

    return final_clusters


def cluster_all_emails(
    db: Session,
    user_id: int,
    dataset_id: int,
    clustering_algorithm: str,
    k_clusters: int | None = None,
    embedder_type: str = None,
    embedder_model: str = None,
):
    current_ds = get_current_dataset(db, user_id=user_id, dataset_id=dataset_id)
    ds_content = current_ds.get("content")
    text_attribute = current_ds.get("text_attribute")
    subject_attribute = current_ds.get("subject_attribute")
    id_attribute = current_ds.get("id_attribute")

    strategy : ClusteringStrategy = build_clustering_strategy(
        clustering_algorithm,
        k_clusters,
        embedder_type=embedder_type,
        embedder_model=embedder_model,
    )
    strategy_hash = strategy.get_strategy_hash()
    cache_key = build_cluster_documents_cache_key(
        dataset_id=dataset_id,
        strategy_hash=strategy_hash,
        cluster_documents_ids=[d[id_attribute] for d in ds_content]
    )
    cached = _cluster_all_documents_cache.get(cache_key)
    if cached is not None:
        for cluster in cached:
            cluster_emails = cluster['docs']
            cluster_ids = [
                d[id_attribute] for d in cluster_emails
            ]

            cache_key = build_cluster_title_cache_key(dataset_id, cluster_ids)
            _cached_title = _cluster_title_cache.get(cache_key)
            if _cached_title is not None and _cached_title['title'] is not None:
                cluster['title'] = _cached_title['title']

        return cached

    ds_content = [d.__dict__ for d in ds_content]
    res=  _cluster_documents(
        ds_content,
        strategy,
        content_attribute=text_attribute,
        subject_attribute=subject_attribute,
        id_attribute=id_attribute,
        dataset_id=dataset_id,
    )

    _cluster_all_documents_cache.set(cache_key, res)
    return res

def cluster_per_sender(
    db: Session,
    user_id: int,
    dataset_id: int,
    clustering_algorithm: str,
    k_clusters: int | None = None,
    embedder_type: str = None,
    embedder_model: str = None,
):
    current_ds = get_current_dataset(db, user_id=user_id, dataset_id=dataset_id)
    ds_content = current_ds.get("content")
    text_attribute = current_ds.get("text_attribute")
    subject_attribute = current_ds.get("subject_attribute")
    id_attribute = current_ds.get("id_attribute")
    sender_attribute = current_ds.get("sender_attribute")
    dataset_type = current_ds.get("dataset").dataset_type

    strategy = build_clustering_strategy(
        clustering_algorithm,
        k_clusters,
        embedder_type=embedder_type,
        embedder_model=embedder_model,
    )
    strategy_hash = strategy.get_strategy_hash()
    cache_key = build_cluster_documents_cache_key(
        dataset_id=dataset_id,
        strategy_hash=strategy_hash,
        cluster_documents_ids=[d[id_attribute] for d in ds_content]
    )
    cached = _cluster_sender_documents_cache.get(cache_key)
    if cached is not None:
        for sender_cluster in cached:
            for cluster in sender_cluster['clusters']:
                #  "title": cluster_title,
                # "docs": cluster_emails
                cluster_emails = cluster['docs']
                cluster_ids = [
                    d[id_attribute] for d in cluster_emails
                ]

                cache_key = build_cluster_title_cache_key(dataset_id, cluster_ids)
                _cached_title = _cluster_title_cache.get(cache_key)
                if _cached_title is not None and _cached_title['title'] is not None:
                    cluster['title'] = _cached_title['title']

        return cached

    
    percentile = 0 if dataset_type == "MESSAGING_TELEGRAM" else 85
    top_senders = get_top_senders(
        data_dicts=ds_content,
        sender_attribute=sender_attribute,
        percentile=percentile,
    )

    result = []
    for sender in top_senders.keys():
        sender_dicts = [d.__dict__ for d in ds_content if d[sender_attribute] == sender]
        sender_clusters = _cluster_documents(
            sender_dicts,
            strategy,
            content_attribute=text_attribute,
            subject_attribute=subject_attribute,
            id_attribute=id_attribute,
            dataset_id=dataset_id,
        )


        result.append({
            "sender": sender,
            "clusters": sender_clusters,
        })


    _cluster_sender_documents_cache.set(cache_key, result)
    return result

