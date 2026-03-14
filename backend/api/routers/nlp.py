import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.core.dependencies import  get_db, get_current_user


from application.use_cases.emails_analysis import get_cluster_title_prompt, get_dataset_tokens_ngrams, get_dataset_keywords_factory
from application.use_cases.clustering import cluster_all_emails, cluster_per_sender
from application.use_cases.summarizing import  get_group_messages_summarize_prompt, get_group_messages_summary



from domain.db_models import  User
from domain.domain_models.Requests import ClusterPromptTitleRequest, ClusteringRequest, GroupMessagesSummarizePromptRequest, MostImprtantTokensRequest




router = APIRouter()





@router.post("/get_important_tokens")
def get_important_tokens(payload:MostImprtantTokensRequest, current_user: User = Depends(get_current_user),  db: Session = Depends(get_db)):
    """Return the highest-ranked tokens or n-grams for a dataset.

    Authentication:
        Required.

    Request Body:
        dataset_id: int - Dataset identifier to analyze.
        minimum_gram: int | None - Smallest n-gram size.
        maximum_gram: int | None - Largest n-gram size.
        grams_n: int | None - Maximum number of token rows to return.

    Returns:
        items: list[dict] - Ranked rows with text: str and value: float.
    """
    # ! TODO: make it per sender
    most_important_tokens = get_dataset_tokens_ngrams(db, current_user.user_id, payload)
    return most_important_tokens

@router.post("/get_dataset_keywords")
def get_dataset_keywords_route(payload:MostImprtantTokensRequest, current_user: User = Depends(get_current_user),  db: Session = Depends(get_db)):
    """Return extracted keywords for a dataset.

    Authentication:
        Required.

    Request Body:
        dataset_id: int - Dataset identifier to analyze.
        minimum_gram: int | None - Smallest n-gram size.
        maximum_gram: int | None - Largest n-gram size.
        grams_n: int | None - Maximum number of keyword rows to return.

    Returns:
        dataset_keywords: list[dict] - Ranked rows with text: str and value: float.
    """
    dataset_keywords = get_dataset_keywords_factory(db, current_user.user_id, payload)
    return dataset_keywords



@router.post("/clusters_per_sender")
async def get_clusters_per_sender_route(request:ClusteringRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Cluster dataset content separately for top senders.

    Authentication:
        Required.

    Request Body:
        dataset_id: int - Dataset identifier to cluster.
        clustering_algorithm: str - Clustering strategy key.
        k_clusters: int | None - Explicit cluster count when required.
        embedder_type: str | None - Embedding backend type.
        embedder_model: str | None - Embedding model name.

    Returns:
        items: list[dict] - Sender-level groups.
        sender_signature: str - Sender grouping key.
        num_emails: int - Number of emails in the sender group.
        clusters: list[dict] - Cluster payloads with title and docs.
    """


    cluster_results = cluster_per_sender(db, 
                                         current_user.user_id, 
                                         request.dataset_id, 
                                         request.clustering_algorithm, 
                                         request.k_clusters,
                                         request.embedder_type,
                                         request.embedder_model
                                )

    return cluster_results


@router.post("/clusters_all")
async def get_clusters_all_route(request:ClusteringRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Cluster all dataset content into a single clustering result set.

    Authentication:
        Required.

    Request Body:
        dataset_id: int - Dataset identifier to cluster.
        clustering_algorithm: str - Clustering strategy key.
        k_clusters: int | None - Explicit cluster count when required.
        embedder_type: str | None - Embedding backend type.
        embedder_model: str | None - Embedding model name.

    Returns:
        clusters: list[dict] - Cluster payloads with title and docs for the whole dataset.
    """
    cluster_results = cluster_all_emails(db, 
                                        current_user.user_id, 
                                        request.dataset_id, 
                                        request.clustering_algorithm, 
                                        request.k_clusters,
                                         request.embedder_type,
                                         request.embedder_model
                            )
    return cluster_results

@router.post("/get_cluster_title_prompt")
async def get_cluster_title_prompt_route(request:ClusterPromptTitleRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Build a prompt and candidate title for a selected cluster.

    Authentication:
        Required.

    Request Body:
        dataset_id: int - Dataset identifier.
        cluster_docs_ids: list[str | int] - Document IDs in the target cluster.
        provider: str - Text generation provider key.
        model: str - Provider model name.

    Returns:
        keywords: list[tuple[str, float]] - Weighted keywords.
        prompt: str - Generated prompt text.
        title: str - Suggested cluster title.
    """

    result = get_cluster_title_prompt(db, current_user.user_id, request.dataset_id, request.cluster_docs_ids, request.provider, request.model)
    return result


@router.post("/get_group_messages_summary_prompt")
async def get_group_messages_summary_prompt_route(request:GroupMessagesSummarizePromptRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Build the summarization prompt for a group of selected messages.

    Authentication:
        Required.

    Request Body:
        dataset_id: int - Dataset identifier.
        cluster_docs_ids: list[str | int] - Message IDs to summarize.

    Returns:
        prompt: str - Summarization prompt text.
        input_token_size_estimated: int - Estimated input token count.
        output_token_size_estimated: int - Estimated output token count.
    """
    result = get_group_messages_summarize_prompt(db, current_user.user_id, request.dataset_id, request.cluster_docs_ids)
    return result

@router.post("/get_group_messages_summary")
async def get_group_messages_summary_route(request:ClusterPromptTitleRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Generate a summary for a selected group of messages.

    Authentication:
        Required.

    Request Body:
        dataset_id: int - Dataset identifier.
        cluster_docs_ids: list[str | int] - Message IDs to summarize.
        provider: str - Text generation provider key.
        model: str - Provider model name.

    Returns:
        answer: str - Generated summary.
        input_token_size_estimated: int - Estimated input token count.
        output_token_size_estimated: int - Estimated output token count.
    """
    result = get_group_messages_summary(db, current_user.user_id, request.dataset_id, request.cluster_docs_ids, model=request.model, provider=request.provider)
    return result


@router.post("/get_cluster_title_prompt")
async def get_cluster_title_prompt_route(request:ClusterPromptTitleRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Build a prompt and candidate title for a selected cluster.

    Authentication:
        Required.

    Request Body:
        dataset_id: int - Dataset identifier.
        cluster_docs_ids: list[str | int] - Document IDs in the target cluster.
        provider: str - Text generation provider key.
        model: str - Provider model name.

    Returns:
        keywords: list[tuple[str, float]] - Weighted keywords.
        prompt: str - Generated prompt text.
        title: str - Suggested cluster title.
    """

    result = get_cluster_title_prompt(db, current_user.user_id, request.dataset_id, request.cluster_docs_ids, request.provider, request.model)
    return result


