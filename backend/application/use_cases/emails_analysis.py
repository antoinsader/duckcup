
from collections import defaultdict
from sqlalchemy.orm import Session


from application.factories.DatasetFactory import get_current_dataset
from application.prompts import PromptKey
from application.factories.PromptFactory import get_prompter

from domain.domain_models.Requests import MostImprtantTokensRequest


from infrastructure.keyword_extraction.keybert import KeyBertKeywordExtractor
from infrastructure.ner.normalization import normalize_texts
from infrastructure.tfidf_service import  get_tfidf_list_grams
from infrastructure.build_prompt.prompt_manager import render_prompt
from infrastructure.cache.cache_store import InMemoryLruCache
from infrastructure.cache.key_builders import build_cluster_title_cache_key


_cluster_title_cache = InMemoryLruCache(max_size=256)

# def _get_cleaned_content(ds_content, sender_attribute='sender_signature', text_attribute='content_clean'):
#     """
#         Pipeline:
#             Get top senders => clean repeated grams for each group (sender's emails) of emails
#     Returns:
#     --------------
#     (cleaned_emails_list, most_repeated_grams_per_sender): tuple
#         cleaned_emails_list: list[SAME TYPE OF DS_CONTENT] but with text_attribute has a cleaned value 
#         most_repeated_grams_per_sender dict {sender_name: list_of_repeated_grams}
#     """
#     top_senders = get_top_senders(ds_content, sender_attribute=sender_attribute)



#     cleaned_content = [m.copy() for m in ds_content]
#     most_repeated_grams_per_sender = {}
#     for ts in top_senders.keys():
#         sender_mails = [{text_attribute: m[text_attribute] , "idx": idx}  for (idx,m) in enumerate(ds_content) if m[sender_attribute] == ts ]
#         mails_texts = [m[text_attribute] for m in sender_mails]
#         cleaned, most_repeated_grams = clean_repeated_grams(mails_texts)
#         most_repeated_grams_per_sender[ts] = most_repeated_grams

#         for idx_obj, clean_txt in zip(sender_mails, cleaned):
#             cleaned_content[idx_obj["idx"]][text_attribute] = clean_txt

#     return cleaned_content, most_repeated_grams_per_sender

def get_dataset_tokens_ngrams(db, user_id, payload: MostImprtantTokensRequest):
    """Returns list of dictionaries {text, value}"""



    dataset_id = payload.dataset_id
    # This will verify dataset and user and return the dataset content
    # dataset content might be list[FileDatasetRepository] or list[EmailFront] 
    current_ds = get_current_dataset(db, user_id = user_id, dataset_id=dataset_id)

    ds_content = current_ds.get("content")
    text_attribute = current_ds.get("text_attribute")

    min_gram  = payload.minimum_gram
    max_gram = payload.maximum_gram
    grams_n = payload.grams_n
    # important_tokens_n = payload.important_tokens_n


    # ! THIS NEEDS TO BE REVIEWED
    # cleaned_content, most_repeated_grams_per_sender = _get_cleaned_content(ds_content, sender_attribute=sender_attribute, text_attribute=text_attribute)


    content_texts = [m[text_attribute] for m in ds_content]

    # List of dict {token, score}
    # spacy_tokenizer = SpacyTokenizer(SpacyTokenizerConfig())
    # list_tokens = spacy_tokenizer.tokenize(content_texts)
    # most_important_tokens = get_tfidf_list_tokens(list_tokens, top_n=important_tokens_n)

    # List of most important grams
    top_grams_tokens = get_tfidf_list_grams(list_texts=content_texts, min_gram=min_gram, max_gram=max_gram, top_n=grams_n)
    return [ {"text": text, "value": score} for text, score in top_grams_tokens]


def get_dataset_keywords(texts : list[str], top_n:int=100) -> list[tuple[str, float]]:
    """Using keybert extract top n keywords from list of strings"""
    keyword_extractor = KeyBertKeywordExtractor()
    keywords_per_doc = keyword_extractor.extract_keywords(texts, top_n=20)
    all_phrases = []
    all_scores = []
    for kw_list in keywords_per_doc:
        for phrase, score in kw_list:
            all_phrases.append(phrase)
            all_scores.append(score)

    normalized_phrases = normalize_texts(all_phrases)

    keyword_frequency = defaultdict(int)
    keyword_scores = defaultdict(list)
    for norm, score in zip(normalized_phrases, all_scores):
        keyword_frequency[norm] += 1
        keyword_scores[norm].append(score)

    keyword_final_scores = {}
    for phrase in keyword_frequency:
        freq = keyword_frequency[phrase]
        avg_score = sum(keyword_scores[phrase]) / len(keyword_scores[phrase])
        combined_score = freq * avg_score
        keyword_final_scores[phrase] = combined_score

    keywords_list = KeyBertKeywordExtractor.remove_subphrases(keyword_final_scores)
    sorted_keywords = sorted(keywords_list.items(), key=lambda item: item[1], reverse=True)
    return sorted_keywords[:top_n]



def get_dataset_keywords_factory(db:Session, user_id: int, payload: MostImprtantTokensRequest) -> list[dict]:
    """Returns list of dict{text, value} """
    dataset_id = payload.dataset_id
    top_n = payload.grams_n
    current_ds = get_current_dataset(db, user_id = user_id, dataset_id=dataset_id)
    ds_content = current_ds.get("content")
    text_attribute = current_ds.get("text_attribute")
    content_texts = [m[text_attribute] for m in ds_content]

    dataset_keywords = get_dataset_keywords(content_texts, top_n=top_n)
    return [ {"text": text, "value": score} for text, score in dataset_keywords]





def get_cluster_title_prompt(db: Session, 
                             user_id: int,  
                             dataset_id: int, 
                             cluster_docs_ids: list[str], 
                             provider: str, 
                             model: str) -> dict:
    """Using caching depending on dataset_id, cluster_docs_ids. Returns dict{title, prompt} """

    current_ds = get_current_dataset(db, user_id =user_id, dataset_id=dataset_id)
    ds_content = current_ds.get("content")
    text_attribute = current_ds.get("text_attribute")
    id_attribute = current_ds.get("id_attribute")
    cache_key = build_cluster_title_cache_key(
        dataset_id=dataset_id,
        cluster_docs_ids=cluster_docs_ids,
    )
    cached = _cluster_title_cache.get(cache_key)
    if cached is not None:
        return cached



    if current_ds["dataset"].dataset_type == "EMAIL_GMAIL":
        subject_attribute = current_ds.get("subject_attribute")
        sender_attribute = current_ds.get("sender_attribute")
        keywords = [f"Sender: {doc[sender_attribute]}, Subject: {doc[subject_attribute]}" for doc in ds_content if doc[id_attribute] in cluster_docs_ids]
        prompt = render_prompt(PromptKey.EMAILS_CLUSTER_TITLE, keywords)
    else:
        cluster_texts = [doc[text_attribute] for doc in ds_content if doc[id_attribute] in cluster_docs_ids]
        cluster_text = " ".join(cluster_texts)
        keyword_extractor = KeyBertKeywordExtractor()
        keywords = keyword_extractor.extract_keywords(cluster_text, top_n=10, keyphrase_ngram_range=(2,4))
        prompt = render_prompt(PromptKey.CLUSTER_TITLE, keywords)






    
    prompter = get_prompter(db, user_id = user_id, prompter_name=provider, model=model)
    title = prompter.answer_prompt(prompt)
    result = {
        "prompt": prompt,
        "title": title
    }
    _cluster_title_cache.set(cache_key, result)
    return result
