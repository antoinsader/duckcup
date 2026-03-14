from pydantic import BaseModel, field_validator, Field
from typing import List, Optional

from domain.enums import clustering_algorithms





# ========== SECRET =================
class Token(BaseModel):
    access_token: str = Field(..., description="JWT access token returned after authentication.")
    token_type: str = Field(..., description="Authentication scheme for the access token.")


class AppKey(BaseModel):
    encrypted_key: str = Field(..., description="Provider API key encrypted on the client before upload.")


# ========== USER =================
class UserDeleteRequest(BaseModel):
    user_id: int = Field(..., description="Identifier of the user account to delete.")
    special_password : str = Field(..., description="Administrative password required to authorize the operation.")


class UserLoginRequest(BaseModel):
    username: str = Field(..., description="Username used to authenticate the local account.")
    password: str = Field(..., description="Plain-text password submitted for authentication.")


class AdminRequest(BaseModel):
    special_password : str = Field(..., description="Administrative password required to access admin-only endpoints.")


# ========== ACCOUNT =================
class AccountRequest(BaseModel):
    account_id : int = Field(..., description="Identifier of the connected account to target.")


class AccountProviderRequest(BaseModel):
    provider_id: str = Field(..., description="Provider identifier, such as gmail or telegram.")

# ========== DATASET =================
class DsRequest(BaseModel):
    dataset_id : int = Field(..., description="Identifier of the dataset to retrieve or mutate.")


class DsEmailRequest(BaseModel):
    dataset_id : int = Field(..., description="Identifier of the dataset that contains the email.")
    email_id: str = Field(..., description="Identifier of the email inside the dataset.")


# ========== NLP =================
class MostImprtantTokensRequest(BaseModel):
    dataset_id: int = Field(..., description="Identifier of the dataset to analyze.")
    minimum_gram: Optional[int] = Field(1, description="Smallest n-gram size to include in the analysis.")
    maximum_gram: Optional[int] = Field(5, description="Largest n-gram size to include in the analysis.")
    grams_n: Optional[int] = Field(100, description="Maximum number of ranked tokens or n-grams to return.")


class ClusteringRequest(BaseModel):
    dataset_id: int = Field(..., description="Identifier of the dataset whose content will be clustered.")
    clustering_algorithm: str = Field(
        ...,
        description=f"Clustering algorithm to apply. Supported values come from domain.enums.clustering_algorithms: {clustering_algorithms}.",
    )
    embedder_type: Optional[str] = Field(None, description="Embedding provider family used before clustering when embeddings are required.")
    embedder_model : Optional[str] = Field(None, description="Embedding model name used by the selected embedder type.")
    k_clusters: Optional[int] = Field(None, description="Explicit number of clusters to create when the algorithm requires it.")


class GroupMessagesSummarizePromptRequest(BaseModel):
    dataset_id: int = Field(..., description="Identifier of the dataset that owns the selected messages.")
    cluster_docs_ids: List[str] | List[int] = Field(..., description="Identifiers of the messages to summarize together.")


class ClusterPromptTitleRequest(BaseModel):
    dataset_id: int = Field(..., description="Identifier of the dataset that owns the selected cluster documents.")
    cluster_docs_ids: List[str] | List[int] = Field(..., description="Identifiers of the documents that belong to the cluster.")

    provider: str = Field(..., description="Text-generation provider used to build the prompt or title.")
    model: str = Field(..., description="Provider model name used for prompt or title generation.")



# ========== TELEGRAM =================
class TelegramAuthStartRequest(BaseModel):
    state: str = Field(..., description="Temporary OAuth-like state token created for the Telegram login flow.")
    api_id: int = Field(..., description="Telegram API ID associated with the client application.")
    api_hash: str = Field(..., description="Telegram API hash associated with the client application.")
    phone_number: str = Field(..., description="Phone number of the Telegram account being connected.")


class TelegramAuthVerifyRequest(BaseModel):
    state: str = Field(..., description="Temporary state token returned by the Telegram start step.")
    code: str = Field(..., description="Verification code sent by Telegram to complete sign-in.")
    password: Optional[str] = Field(None, description="Two-factor authentication password when the Telegram account requires it.")


class TelegramAuthReloginRequest(BaseModel):
    account_id: int = Field(..., description="Identifier of the Telegram account that should be reauthenticated.")


class TelegramEntitiesRequest(BaseModel):
    account_id: int = Field(..., description="Identifier of the Telegram account whose entities will be listed.")
    limit: int = Field(100, description="Maximum number of entities to return.")


class TelegramMessagesRequest(BaseModel):
    account_id: int = Field(..., description="Identifier of the Telegram account that owns the chat.")
    limit: int = Field(500, description="Maximum number of messages to fetch from the chat.")
    chat_id: str = Field(..., description="Telegram chat identifier to read messages from.")

class TelegramAnalyzeMessagesRequest(BaseModel):
    account_id: int = Field(..., description="Identifier of the Telegram account whose entities will be analyzed.")
    entities: List[dict] = Field(...,
        description="List of objects, each containing 'chat_id' (str) and 'limit' (int) for Telegram message analysis.",
        min_items=1,
        example=[{"chat_id": "123456", "limit": 100}]
    )


class TelegramMessageMediaRequest(BaseModel):
    account_id: int = Field(..., description="Identifier of the Telegram account that owns the chat.")
    chat_id: str = Field(..., description="Telegram chat identifier that contains the message.")
    message_id: str = Field(..., description="Telegram message identifier whose media should be retrieved.")


class TelegramEntityMessageTupleRequest(BaseModel):
    entity_id: str = Field(..., description="Telegram entity identifier selected for dataset creation.")
    message_id: str = Field(..., description="Telegram message identifier selected for dataset creation.")


class TelegramSaveDatasetRequest(BaseModel):
    account_id: int = Field(..., description="Identifier of the Telegram account that owns the selected messages.")
    dataset_name: str = Field(..., description="Name to assign to the generated dataset.")
    entity_message_tuples: list[TelegramEntityMessageTupleRequest] = Field(
        ...,
        description="Pairs of entity and message identifiers that should be included in the dataset.",
    )




# ========== GMAILS =================
class EmailRequest(BaseModel):
    email_id: str = Field(..., description="Identifier of the email to retrieve.")
    account_id: int = Field(..., description="Identifier of the connected email account that owns the email.")


class InboxCriteria(BaseModel):
    sender_email: Optional[str] = Field(None, description="Optional sender email address to filter the inbox results.")
    subject: Optional[str] = Field(None, description="Optional subject fragment used to filter inbox results.")
    date_from: Optional[str] = Field(None, description="Inclusive lower bound for the email date filter.")
    date_to: Optional[str] = Field(None, description="Inclusive upper bound for the email date filter.")
    only_unseen: bool = Field(False, description="When true, only unread emails are returned.")
    sort_by: str = Field("newest_first", description="Sort order for the inbox results.")

    def to_cache_key(self) -> str:
        # Use a tuple of sorted items for stable key, None as 'null'
        values = (
            self.sender_email or "null",
            self.subject or "null",
            self.date_from or "null",
            self.date_to or "null",
            str(self.only_unseen),
            self.sort_by or "null"
        )
        return "InboxCriteria:" + ":".join(values)

    @field_validator("sender_email", "subject", "date_from", "date_to", mode="before")
    @classmethod
    def empty_str_to_none(cls, value):
        if value is None:
            return None
        if isinstance(value, str):
            normalized = value.strip()
            return normalized if normalized else None
        return value

    @field_validator("sort_by", mode="before")
    @classmethod
    def validate_sort_by(cls, value):
        if not isinstance(value, str):
            return "newest_first"
        normalized = value.strip().lower()
        if normalized in {"newest_first", "oldest_first", "sender_name"}:
            return normalized
        return "newest_first"


class GmailInboxCriteriaRequest(BaseModel):
    account_id: int = Field(..., description="Identifier of the connected email account to browse.")
    criteria: InboxCriteria = Field(default_factory=InboxCriteria, description="Filter criteria applied to the inbox query.")
    page_num: int = Field(1, description="1-based page number to fetch.")
    num_rows: int = Field(50, description="Maximum number of items to include in one page.")
    all : bool = Field(False, description="When true, ignore the criteria and return the full inbox page.")


class SaveEmailsDatasetRequest(BaseModel):
    account_id: int = Field(..., description="Identifier of the connected email account that owns the source emails.")
    criteria: InboxCriteria = Field(default_factory=InboxCriteria, description="Filter criteria used to select emails for the dataset.")
    ds_name: str = Field(..., description="Name to assign to the saved dataset.")
