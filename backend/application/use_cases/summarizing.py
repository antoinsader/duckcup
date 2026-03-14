from sqlalchemy.orm import Session
from collections import defaultdict

from application.factories.DatasetFactory import get_current_dataset
from application.factories.PromptFactory import get_prompter
from infrastructure.build_prompt.prompt_manager import estimate_text_tokens, render_prompt
from application.prompts import PromptKey
from infrastructure.cache.cache_store import InMemoryLruCache
from infrastructure.cache.key_builders import build_summarize_documents_cache_key

_summarizing_documents_cache = InMemoryLruCache(max_size=512)


def get_group_messages_summarize_prompt(db: Session, user_id: int, dataset_id: int, cluster_docs_ids: list[str]):
    current_ds = get_current_dataset(db, user_id =user_id, dataset_id=dataset_id)
    # prompter = get_prompter(db, user_id = user_id, prompter_name=provider, model=model)
    ds_content = current_ds.get("content")
    text_attribute = current_ds.get("text_attribute")
    id_attribute = current_ds.get("id_attribute")
    date_attribute = current_ds.get("date_attribute")
    sender_attribute = current_ds.get("sender_attribute")


    group_content = [doc for doc in ds_content if doc[id_attribute] in cluster_docs_ids]

    prompt = render_prompt(
        PromptKey.MESSAGES_GROUP_SUMMARY, 
        group_content, 
        text_attribute=text_attribute, 
        sender_attribute=sender_attribute, 
        date_attribute=date_attribute)


    input_tokens_count_estimation = estimate_text_tokens(prompt)
    output_tokens_count_estimation = 220
    return {
        "prompt": prompt,
        "input_token_size_estimated": input_tokens_count_estimation,
        "output_token_size_estimated": output_tokens_count_estimation
    }

def get_group_messages_summary(db: Session, user_id: int, dataset_id: int, cluster_docs_ids: list[str], provider: str, model: str):
    current_ds = get_current_dataset(db, user_id =user_id, dataset_id=dataset_id)
    prompter = get_prompter(db, user_id = user_id, prompter_name=provider, model=model)
    ds_content = current_ds.get("content")
    text_attribute = current_ds.get("text_attribute")
    id_attribute = current_ds.get("id_attribute")
    date_attribute = current_ds.get("date_attribute")
    sender_attribute = current_ds.get("sender_attribute")


    cache_key = build_summarize_documents_cache_key(
        dataset_id=dataset_id,
        cluster_docs_ids=cluster_docs_ids,
        provider=provider,
        model=model
    )
    cached = _summarizing_documents_cache.get(cache_key)
    if cached is not None and cached['answer'] is not None:
        return cached
    


    group_content = [doc for doc in ds_content if doc[id_attribute] in cluster_docs_ids]
    prompt = render_prompt(
        PromptKey.MESSAGES_GROUP_SUMMARY, 
        group_content, 
        text_attribute=text_attribute, 
        sender_attribute=sender_attribute, 
        date_attribute=date_attribute)




    answer = prompter.answer_prompt(prompt)
    input_tokens_count_estimation = estimate_text_tokens(prompt)
    output_tokens_count_estimation = estimate_text_tokens(answer)
    res = {
        "answer": answer,
        "input_token_size_estimated": input_tokens_count_estimation,
        "output_token_size_estimated": output_tokens_count_estimation        
    }
    _summarizing_documents_cache.set(cache_key, res)
    return res

# def summarize_text_falcon(text, max_tokens=70):
#     summarizer = HuggingFaceLocalSummarizer('Falconsai/text_summarization')
#     return summarizer.summarize(text)



# def _summarize_email_pipeline(email: dict, group_emails : list[dict], embedder: Embedder, prompter: Prompter, faiss_topk=3) -> str:
#     """
#     Parameters:
#     ------------
#     email: the email dict that you want to summarize
#     group_emails: are group of emails dicts that are on the same group of the email you want to summarize, 
#         from those emails we will faiss search for similar emails to the main email
#         they can be same sender emails 
#     embedder: the embedder to be used for FAISS similarity search
#     prompter: the prompter you want to use to summarize the email
#     faiss_topk: how many emails you want to consider as the background

#     Pipeline:
#     ----------
#     Clean repeated grams from the group of the emails
#     Embed group_emails and create FAISS index using the embeddings
#     Embed email and search faiss index for topk emails similar to email's embeddings
#     Build email summary prompt from the email and similar emails
#     Ask the prompter and return the answer

#     Returns:
#     -------------
#     summary: string
#     """
#     texts = [m['content_clean'] for m in group_emails]

#     cleaned_texts = clean_repeated_grams(texts + [email['content_clean']])
#     email['content_clean'] = cleaned_texts[-1]
#     cleaned_texts = cleaned_texts[:-1]
#     for em, cleaned in zip(group_emails, cleaned_texts):
#         em['content_clean'] = cleaned


#     embs = embedder.embed(cleaned_texts)
#     faiss_ser = MyFaiss(embs.shape[1])
#     faiss_ser.build_faiss(embs)

#     email_emb = embedder.embed(email['content_clean'])
#     similar_emails_idxs = faiss_ser.search_faiss(email_emb, topk=min(faiss_topk, len(cleaned_texts)))

#     similar_emails = [group_emails[sim_idx] for sim_idx in similar_emails_idxs]
#     summarize_prompt = PROMPTS.EMAIL_SUMMARY(email, similar_emails)
#     summary = prompter.answer_prompt(summarize_prompt)
#     return summary


# def _get_prompter_embedder(db, prompter_name, model_name, user_id):
#     prompter = None
#     if prompter_name == PROMPTER_NAMES.HUGGING_FACE.value:
#         hf_cfg = HuggingFacePrompterConfig()
#         hf_cfg.model = model_name
#         hf_cfg.hf_token = get_hugging_face_key(db, user_id)
#         prompter = HuggingFacePrompter(hf_cfg)
#     elif prompter_name == PROMPTER_NAMES.POLLINATION.value:
#         p_cfg = PollinationsPrompterConfig()
#         p_cfg.model = model_name
#         p_cfg.pollination_key = get_pollination_key(db, user_id)
#         prompter = PollinationPrompter(hf_cfg)
#     else:
#         raise ApplicationError(
#             f"Prompter {prompter_name} is not valid",
#             layer=ERRORS_LAYERS.SUMMARIZATION,
#         )
#     embedder= OllamaEmbedder(OllamaEmbedderConfig())
#     return (prompter, embedder)


# def summarize_email(db:Session,ds: Dataset, user: User, email_id, prompter_name, model_name):
#     """
#         ds: where the email is from
#         user: owner of the email
#         email_id: key to get the email you want to summarize
#         prompter_name: one of the prompters ('hugging_face', 'pollination')
#         model_name: model to use in prompter
#     """
#     faiss_topk = 3
#     if prompter_name not in PROMPTER_NAMES._value2member_map_:
#         raise ApplicationError(
#             f"The prompter: {prompter_name} does not exists, choose from: {PROMPTER_NAMES}",
#             layer=ERRORS_LAYERS.SUMMARIZATION,
#         )

#     if model_name not in PROMPTER_MODELS[prompter_name]:
#         raise ApplicationError(
#             f"The model: {model_name} does not exists in prompter {prompter_name} models, choose from: {PROMPTER_MODELS[prompter_name]}",
#             layer=ERRORS_LAYERS.SUMMARIZATION,
#             details={"prompter_name": prompter_name, "models": PROMPTER_MODELS[prompter_name]}
#         )

#     encrypter = FernetEncrypter( settings.backend_secrets_encryption_key.get_secret_value())

#     file_repo = FileDatasetRepository(user.id, ds.ds_name, encrypter)
#     all_emails = file_repo.load_dataset()
#     email = next(m for m in all_emails if m['email_id'] == email_id)
#     cache = file_repo.get_email_adv_summary(email_id, prompter_name, model_name)
#     if cache:
#         return cache

#     prompter, embedder = _get_prompter_embedder(db, prompter_name, model_name, user.id)

#     same_sender_emails = [m for m in all_emails if m['sender_signature'] == email['sender_signature']]
#     summary = _summarize_email_pipeline(email, same_sender_emails, embedder, prompter, faiss_topk=faiss_topk)

#     file_repo.save_email_adv_summary(email_id, prompter_name, model_name, summary)
#     return summary


# def summarize_dataset_emails(db: Session, ds: Dataset, user: User, prompter_name: str, model_name:str , faiss_topk=3):
#     if prompter_name not in PROMPTER_NAMES._value2member_map_:
#         raise ApplicationError(
#             f"The prompter: {prompter_name} does not exists, choose from: {PROMPTER_NAMES}",
#             layer=ERRORS_LAYERS.SUMMARIZATION,
#         )

#     if model_name not in PROMPTER_MODELS[prompter_name]:
#         raise ApplicationError(
#             f"The model: {model_name} does not exists in prompter {prompter_name} models, choose from: {PROMPTER_MODELS[prompter_name]}",
#             layer=ERRORS_LAYERS.SUMMARIZATION,
#             details={"prompter_name": prompter_name, "models": PROMPTER_MODELS[prompter_name]}
#         )

#     faiss_topk = 5
#     encrypter = FernetEncrypter( settings.backend_secrets_encryption_key.get_secret_value())
#     files_repo = FileDatasetRepository(user.user_id, ds.ds_name, encrypter)
#     emails = files_repo.load_dataset()
#     summaries = [{[e['email_id']]: ""} for e in emails]
#     summaries = [{[e['id']]: ""} for e in emails]

#     prompter, embedder = _get_prompter_embedder(db, prompter_name, model_name, user.id)
#     senders_emails = defaultdict(list)
#     for m in emails:
#         senders_emails[m['sender_signature']].push(m)

#     summaries = []
#     email_ids = []
#     for sender_signature, sender_emails in senders_emails.values():
#         for email_idx, email in sender_emails:
#             summary=_summarize_email_pipeline(email, sender_emails, embedder, prompter, faiss_topk)
#             email_ids.append(email['email_id'])
#             summaries.append(summary)
#     files_repo.save_emails_adv_summary(email_ids, prompter_name, model_name, summaries)
#     return True
