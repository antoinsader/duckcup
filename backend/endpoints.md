# API Endpoints

## GET /auth/callback

**Summary:** Google Callback

Complete the provider callback flow and redirect to the frontend.

Authentication:
    Required.

Request Body:
    None.
    Query Params:
        code: str - Provider authorization code.
        state: str - Anti-forgery state token.

Returns:
    redirect_url: str - Frontend URL after provider callback processing.

## GET /auth/telegram/start_form

**Summary:** Telegram Start Form

Return the initial Telegram authentication form state.

Authentication:
    Required.

Request Body:
    None.
    Query Params:
        state: str - Temporary auth state token.

Returns:
    state: str - Echoed/validated flow state.
    start payload: dict - Values required by the next Telegram auth step.

## POST /auth/telegram/start

**Summary:** Telegram Start

Start the Telegram authentication flow for a user account.

Authentication:
    Required.

Request Body:
    state: str - Temporary auth state token.
    api_id: int - Telegram application API ID.
    api_hash: str - Telegram application API hash.
    phone_number: str - Target Telegram phone number.

Returns:
    auth_step: str - Current flow status.
    state: str - State token to continue verification.
    details: dict - Additional provider instructions for the client.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/TelegramAuthStartRequest"
      }
    }
  },
  "required": true
}
```

## POST /auth/telegram/relogin

**Summary:** Telegram Relogin

Restart authentication for an existing Telegram account.

Authentication:
    Required.

Request Body:
    account_id: int - Telegram account identifier to reconnect.

Returns:
    auth_step: str - Current relogin status.
    state: str - State token to continue verification.
    details: dict - Additional provider instructions for the client.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/TelegramAuthReloginRequest"
      }
    }
  },
  "required": true
}
```

## POST /auth/telegram/verify

**Summary:** Telegram Verify

Verify a Telegram login attempt and persist the connected account.

Authentication:
    Required.

Request Body:
    state: str - Temporary auth state token.
    code: str - Verification code received from Telegram.
    password: str | None - 2FA password when required.

Returns:
    account_id: int - Linked account identifier.
    provider_id: str - Provider name for this account.
    account label fields: str - Display metadata returned by AccountFront.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/TelegramAuthVerifyRequest"
      }
    }
  },
  "required": true
}
```

## POST /user/login

**Summary:** Login Route

Authenticate a local user and create a session cookie.

Authentication:
    Not required.

Request Body:
    username: str - Local account username.
    password: str - Local account password.

Returns:
    user_id: int - Authenticated user identifier.
    username: str - Authenticated username.
    Cookie side effect: sets user_token on the response.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/UserLoginRequest"
      }
    }
  },
  "required": true
}
```

## POST /user/register

**Summary:** Register Route

Register a local user and create a session cookie.

Authentication:
    Not required.

Request Body:
    username: str - Desired local account username.
    password: str - Desired local account password.

Returns:
    user_id: int - Newly created user identifier.
    username: str - Created username.
    Cookie side effect: sets user_token on the response.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/UserLoginRequest"
      }
    }
  },
  "required": true
}
```

## GET /user/me

**Summary:** Read User Me

Return the currently authenticated user.

Authentication:
    Required.

Request Body:
    None.

Returns:
    user_id: int - Authenticated user identifier.
    username: str - Authenticated username.

## POST /user/logout

**Summary:** Logout

Clear the local session cookie and redirect to the frontend.

Authentication:
    Not required.

Request Body:
    None.

Returns:
    redirect_url: str - Frontend URL target.
    Cookie side effect: removes user_token from the response.

## POST /account/login_with_provider

**Summary:** Add Account Provider Route

Create a provider login URL for the authenticated user.

Authentication:
    Required.

Request Body:
    provider_id: str - Account provider identifier to connect (for example, gmail or telegram).

Returns:
    redirect_url: str - Provider login URL for the authenticated user.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/AccountProviderRequest"
      }
    }
  },
  "required": true
}
```

## POST /account/get_user_accounts

**Summary:** Get User Accounts Route

List the connected accounts for the authenticated user.

Authentication:
    Required.

Request Body:
    None.

Returns:
    items: list[AccountFront] - Connected accounts for the current user.

## POST /account/delete_account

**Summary:** Delete Ds

Delete one connected account owned by the current user.

Authentication:
    Required.

Request Body:
    account_id: int - Connected account identifier to delete.

Returns:
    success: bool - True when the account is deleted.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/AccountRequest"
      }
    }
  },
  "required": true
}
```

## POST /dataset/get_user_datasets

**Summary:** Get User Datasets Route

List the datasets available to the current user.

Authentication:
    Required.

Request Body:
    None.

Returns:
    items: list - Datasets available to the current user, including public datasets.

## POST /dataset/get_ds_content

**Summary:** Get Ds Content Route

Return the content stored in one dataset.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier to read.

Returns:
    content: list - Dataset entries. Shape depends on dataset type (for example EmailFront or DatasetMessages).

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/DsRequest"
      }
    }
  },
  "required": true
}
```

## POST /dataset/save_inbox_dataset

**Summary:** Save Email Dataset Route

Create a dataset from emails selected from one inbox.

Authentication:
    Required.

Request Body:
    account_id: int - Connected account identifier.
    ds_name: str - New dataset name.
    criteria: dict - Inbox filters with sender_email, subject, date_from, date_to, only_unseen, and sort_by.

Returns:
    dataset_id: int - Created dataset identifier.
    dataset_name: str - Created dataset name.
    owner metadata: mixed - Additional DatasetFront fields.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/SaveEmailsDatasetRequest"
      }
    }
  },
  "required": true
}
```

## POST /dataset/save_messages_dataset

**Summary:** Save Messages Dataset Route

Create a dataset from selected Telegram messages.

Authentication:
    Required.

Request Body:
    account_id: int - Connected Telegram account identifier.
    dataset_name: str - New dataset name.
    entity_message_tuples: list[dict] - Selected pairs of entity_id: str and message_id: str.

Returns:
    dataset_id: int - Created dataset identifier.
    dataset_name: str - Created dataset name.
    owner metadata: mixed - Additional DatasetFront fields.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/TelegramSaveDatasetRequest"
      }
    }
  },
  "required": true
}
```

## POST /dataset/get_html_content

**Summary:** Get Html Content Route

Return the HTML content of one email stored in a dataset.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier that contains the email.
    email_id: str - Email identifier to fetch.

Returns:
    html_content: str - HTML body of the selected dataset email.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/DsEmailRequest"
      }
    }
  },
  "required": true
}
```

## POST /dataset/get_ds_keywords_entities

**Summary:** Get Ds Keywords Entities Route

Return extract entities from dataset content.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier to analyze.

Returns:
    entities_descriptions: dict - Keys are entity labels and values are descriptions of the entity labels.
    keywords: dict - keys are entity labels and value is dict with keys the entity text and values list of message ids where the entity was found.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/DsRequest"
      }
    }
  },
  "required": true
}
```

## POST /dataset/delete_ds

**Summary:** Delete Ds

Delete a dataset and its related stored files.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier to delete.

Returns:
    success: bool - True when dataset deletion succeeds.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/DsRequest"
      }
    }
  },
  "required": true
}
```

## POST /secretes/save_pollination_key

**Summary:** Save Pollination Key

Validate and store the current user's Pollinations API key.

Authentication:
    Required.

Request Body:
    encrypted_key: str - Client-encrypted provider key payload.

Returns:
    success: bool - True when the key is valid and persisted.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/AppKey"
      }
    }
  },
  "required": true
}
```

## POST /secretes/save_huggingface_key

**Summary:** Save Huggingface Key

Validate and store the current user's Hugging Face API key.

Authentication:
    Required.

Request Body:
    encrypted_key: str - Client-encrypted provider key payload.

Returns:
    success: bool - True when the key is valid and persisted.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/AppKey"
      }
    }
  },
  "required": true
}
```

## POST /secretes/get_saved_keys

**Summary:** Get Saved Keys

Return metadata about the currently saved external API keys.

Authentication:
    Required.

Request Body:
    None.

Returns:
    hf_user: dict | None - Hugging Face account metadata if key is valid.
    pollination_user: dict | None - Pollinations account metadata if key is valid.

## GET /secretes/get_rsa_public_key

**Summary:** Get Rsa Public Key Route

Return the RSA public key used to encrypt secrets on the client.

Authentication:
    Required.

Request Body:
    None.

Returns:
    public_key: str - RSA public key used for frontend encryption.

## POST /secretes/delete_huggingface_key

**Summary:** Delete Huggingface Key Route

Delete the saved Hugging Face API key for the current user.

Authentication:
    Required.

Request Body:
    None.

Returns:
    success: bool - True when key deletion succeeds.

## POST /secretes/delete_pollination_key

**Summary:** Delete Pollination Key Route

Delete the saved Pollinations API key for the current user.

Authentication:
    Required.

Request Body:
    None.

Returns:
    success: bool - True when key deletion succeeds.

## GET /meta/login_providers

**Summary:** Get Login Providers

List the login providers supported by the application.

Authentication:
    Not required.

Request Body:
    None.

Returns:
    items: list[LoginProviderFront] - Provider entries with id/name/label fields used by the frontend login chooser.

## GET /meta/hugging_face_text_models

**Summary:** Get Hugging Face Text Models

List available Hugging Face text-generation models.

Authentication:
    Not required.

Request Body:
    None.

Returns:
    items: list[dict] - Model rows, typically including id: str and downloads: int.

## GET /meta/pollination_text_models

**Summary:** Get Pollination Text Models

List available Pollinations text-generation models.

Authentication:
    Not required.

Request Body:
    None.

Returns:
    items: list[dict] - Model rows, typically including name: str and pricing metadata.

## GET /meta/embedders_types

**Summary:** Get Embedders

List the embedding providers available to the application.

Authentication:
    Not required.

Request Body:
    None.

Returns:
    items: list[dict] - Embedder definitions including id, label, description, availability, default model, and external model source links.

## POST /email/get_inbox_meta

**Summary:** Get Inbox Meta Route

Return metadata about the inbox of one connected email account.

Authentication:
    Required.

Request Body:
    account_id: int - Connected account identifier to inspect.

Returns:
    senders_emails: dict[str, str] - Mapping of sender signature to sender email.
    subjects: list[str] - Distinct subjects detected in the inbox sample.
    min_date: str - Oldest email date in the dataset.
    max_date: str - Newest email date in the dataset.
    top_senders: dict[str, int] - Sender frequency summary.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/AccountRequest"
      }
    }
  },
  "required": true
}
```

## POST /email/get_inbox_count

**Summary:** Get Inbox Count Route

Return the number of emails in one connected inbox.

Authentication:
    Required.

Request Body:
    account_id: int - Connected account identifier to count.

Returns:
    count: int - Total emails available in the selected inbox.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/AccountRequest"
      }
    }
  },
  "required": true
}
```

## POST /email/get_inbox_criteria

**Summary:** Get Inbox Criteria Route

List inbox emails for an account using filter and pagination criteria.

Authentication:
    Required.

Request Body:
    account_id: int - Connected account identifier to query.
    criteria: dict - Optional filters with sender_email, subject, date_from, date_to, only_unseen, and sort_by.
    page_num: int - 1-based page number.
    num_rows: int - Page size.
    all: bool - When true, bypass filter criteria.

Returns:
    items: list[EmailFront] - Paginated email items.
    total_count: int - Total items matching the filter.
    page_num: int - Current page number.
    num_rows: int - Current page size.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/GmailInboxCriteriaRequest"
      }
    }
  },
  "required": true
}
```

## POST /email/get_html_content

**Summary:** Get Html Content Route

Return the HTML body of one email from a connected inbox.

Authentication:
    Required.

Request Body:
    account_id: int - Connected account identifier that owns the email.
    email_id: str - Email identifier to fetch.

Returns:
    html_content: str - HTML body of the selected email.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/EmailRequest"
      }
    }
  },
  "required": true
}
```

## POST /telegram/get_entities

**Summary:** Get Entities Route

List Telegram chats or entities for a connected account.

Authentication:
    Required.

Request Body:
    account_id: int - Connected Telegram account identifier.
    limit: int - Max entities/chats to return.

Returns:
    items: list[TelegramEntityFront] - Each item typically includes chat_id: str, chat_name: str, and chat_type: str.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/TelegramEntitiesRequest"
      }
    }
  },
  "required": true
}
```

## POST /telegram/get_messages

**Summary:** Get Messages Route

List messages from one Telegram chat.

Authentication:
    Required.

Request Body:
    account_id: int - Connected Telegram account identifier.
    chat_id: str - Chat identifier to read.
    limit: int - Max messages to return.

Returns:
    items: list[TelegramMessageFront] - Message payloads for the selected chat.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/TelegramMessagesRequest"
      }
    }
  },
  "required": true
}
```

## POST /telegram/get_messages_multiple_chats

**Summary:** Get Messages Multiple Chats Route

List messages from multiple Telegram chats in one request.

Authentication:
    Required.
Request Body:
    account_id: int - Connected Telegram account identifier.
    entities: list[dict] - Each dict containing {chat_id, limit} for the chat to read.
Returns:
    items: list[TelegramMessageFront] - Message payloads for the selected chats.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/TelegramAnalyzeMessagesRequest"
      }
    }
  },
  "required": true
}
```

## POST /telegram/analyze_messages

**Summary:** Analyze Messages Route

Analyze entities found in messages from active Telegram chats.

Authentication:
    Required.

Request Body:
    account_id: int - Connected Telegram account identifier.
    entities: List[dict] - Each dict containing {chat_id, limit}

Returns:
    analysis_entities: dict[str, dict[str, list[str]]] - Entity label to entity value to message IDs.
    entities_descriptions: dict[str, str] - Human-readable description per entity label.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/TelegramAnalyzeMessagesRequest"
      }
    }
  },
  "required": true
}
```

## POST /telegram/get_message_media

**Summary:** Get Message Media Route

Return the media attached to one Telegram message.

Authentication:
    Required.

Request Body:
    account_id: int - Connected Telegram account identifier.
    chat_id: str - Chat identifier containing the message.
    message_id: str - Message identifier with media.

Returns:
    Binary response body with media bytes.
    Headers include Content-Type and inline filename via Content-Disposition.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/TelegramMessageMediaRequest"
      }
    }
  },
  "required": true
}
```

## POST /nlp/get_important_tokens

**Summary:** Get Important Tokens

Return the highest-ranked tokens or n-grams for a dataset.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier to analyze.
    minimum_gram: int | None - Smallest n-gram size.
    maximum_gram: int | None - Largest n-gram size.
    grams_n: int | None - Maximum number of token rows to return.

Returns:
    items: list[dict] - Ranked rows with text: str and value: float.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/MostImprtantTokensRequest"
      }
    }
  },
  "required": true
}
```

## POST /nlp/get_dataset_keywords

**Summary:** Get Dataset Keywords Route

Return extracted keywords for a dataset.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier to analyze.
    minimum_gram: int | None - Smallest n-gram size.
    maximum_gram: int | None - Largest n-gram size.
    grams_n: int | None - Maximum number of keyword rows to return.

Returns:
    dataset_keywords: list[dict] - Ranked rows with text: str and value: float.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/MostImprtantTokensRequest"
      }
    }
  },
  "required": true
}
```

## POST /nlp/clusters_per_sender

**Summary:** Get Clusters Per Sender Route

Cluster dataset content separately for top senders.

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

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/ClusteringRequest"
      }
    }
  },
  "required": true
}
```

## POST /nlp/clusters_all

**Summary:** Get Clusters All Route

Cluster all dataset content into a single clustering result set.

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

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/ClusteringRequest"
      }
    }
  },
  "required": true
}
```

## POST /nlp/get_cluster_title_prompt

**Summary:** Get Cluster Title Prompt Route

Build a prompt and candidate title for a selected cluster.

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

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/ClusterPromptTitleRequest"
      }
    }
  },
  "required": true
}
```

## POST /nlp/get_group_messages_summary_prompt

**Summary:** Get Group Messages Summary Prompt Route

Build the summarization prompt for a group of selected messages.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier.
    cluster_docs_ids: list[str | int] - Message IDs to summarize.

Returns:
    prompt: str - Summarization prompt text.
    input_token_size_estimated: int - Estimated input token count.
    output_token_size_estimated: int - Estimated output token count.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/GroupMessagesSummarizePromptRequest"
      }
    }
  },
  "required": true
}
```

## POST /nlp/get_group_messages_summary

**Summary:** Get Group Messages Summary Route

Generate a summary for a selected group of messages.

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

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/ClusterPromptTitleRequest"
      }
    }
  },
  "required": true
}
```

## POST /admin/get_all_users

**Summary:** Read User Me

List all users when the admin password is provided.

Authentication:
    Not session-based. Requires the admin special password in the request body.

Request Body:
    special_password: str - Admin password gate.

Returns:
    items: list[User_Front] - Full user list when password is valid.
    [] - Empty list when password is invalid.

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/AdminRequest"
      }
    }
  },
  "required": true
}
```

## POST /admin/delete_user

**Summary:** Read User Me

Delete a user account when the admin password is provided.

Authentication:
    Not session-based. Requires the admin special password in the request body.

Request Body:
    user_id: int - User identifier to delete.
    special_password: str - Admin password gate.

Returns:
    success: bool - True when deletion succeeds.
    [] - Empty list when password is invalid (current behavior).

**Request Body**

```json
{
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/UserDeleteRequest"
      }
    }
  },
  "required": true
}
```

## GET /

**Summary:** Read Root

Return a basic health response for the API.

Authentication:
    Not required.

Request Body:
    None.

Returns:
    message: str - Human-readable status message.
    success: bool - True when the API process is reachable.

