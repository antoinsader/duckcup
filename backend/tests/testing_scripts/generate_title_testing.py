


from api.core.config import settings
from api.core.db import create_db_engine, create_session_factory
from application.factories.DatasetFactory import get_current_dataset
from application.prompts.registry import PromptKey
from application.repositories.userKeysRepository import UserKeysRepositoryDb
from infrastructure.build_prompt.prompt_manager import render_prompt
from infrastructure.encryption.fernet import FernetEncrypter
from infrastructure.keyword_extraction.keybert import KeyBertKeywordExtractor
from infrastructure.prompter.pollinations import PollinationPrompter, PollinationsPrompterConfig


def prompter_anser_test():
    dataset_id = 4
    user_id = 1
    cluster_docs_ids = [9021, 9010,9007, 9004, 9002]
    engine = create_db_engine(settings.database_url)
    sessionLocale = create_session_factory(engine)
    db = sessionLocale()
    prompt = "Hey how are you? what is the capital of France?"
    encryption_service = FernetEncrypter(settings.backend_secrets_encryption_key.get_secret_value())
    repo = UserKeysRepositoryDb(db, encryption_service)
    k = repo.get_user_key(key_name='pollination_key',  user_id=user_id)
    prompter = PollinationPrompter(
        PollinationsPrompterConfig(
            pollination_key=k,
            model="polly",
        )
    )
    title = prompter.answer_prompt(prompt)
    print(f"Generated answer: {title}")

def main():
    dataset_id = 4
    user_id = 1
    cluster_docs_ids = [9021, 9010,9007, 9004, 9002]
    engine = create_db_engine(settings.database_url)
    sessionLocale = create_session_factory(engine)
    db = sessionLocale()
    current_ds = get_current_dataset(db, user_id =user_id, dataset_id=dataset_id)
    ds_content = current_ds.get("content")
    text_attribute = current_ds.get("text_attribute")
    id_attribute = current_ds.get("id_attribute")
    cluster_texts = [doc[text_attribute] for doc in ds_content if doc[id_attribute] in cluster_docs_ids]

    cluster_text = " ".join(cluster_texts)
    keyword_extractor = KeyBertKeywordExtractor()
    keywords = keyword_extractor.extract_keywords(cluster_text, top_n=10, keyphrase_ngram_range=(2,4))

    prompt = render_prompt(PromptKey.CLUSTER_TITLE, keywords)
    encryption_service = FernetEncrypter(settings.backend_secrets_encryption_key.get_secret_value())
    repo = UserKeysRepositoryDb(db, encryption_service)
    k = repo.get_user_key(key_name='pollination_key',  user_id=user_id)
    prompter = PollinationPrompter(
        PollinationsPrompterConfig(
            pollination_key=k,
            model="polly",
        )
    )
    title = prompter.answer_prompt(prompt)
    print(f"Generated title: {title}")
