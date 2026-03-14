


from api.core.config import settings
from api.core.db import create_db_engine, create_session_factory
from application.factories.DatasetFactory import get_current_dataset
from application.factories.PromptFactory import get_prompter
from application.prompts.registry import PromptKey
from infrastructure.build_prompt.prompt_manager import render_prompt


def main():
    engine = create_db_engine(settings.database_url)
    SessionLocal = create_session_factory(engine)
    db = SessionLocal()

    user_id = 1
    dataset_id = 4

    provider = "hugging_face"
    model = "Qwen/Qwen2.5-7B-Instruct"
    current_ds = get_current_dataset(db, user_id =user_id, dataset_id=dataset_id)
    prompter = get_prompter(db, user_id = user_id, prompter_name=provider, model=model)
    ds_content = current_ds.get("content")
    text_attribute = current_ds.get("text_attribute")
    id_attribute = current_ds.get("id_attribute")
    date_attribute = current_ds.get("date_attribute")
    sender_attribute = current_ds.get("sender_attribute")
    cluster_docs_ids = [ 36885, 36884,36883,36882,36881,36880]
    group_content = [doc for doc in ds_content if doc[id_attribute] in cluster_docs_ids]

    prompt = render_prompt(
        PromptKey.MESSAGES_GROUP_SUMMARY, 
        group_content, 
        text_attribute=text_attribute, 
        sender_attribute=sender_attribute, 
        date_attribute=date_attribute)
    answer = prompter.answer_prompt(prompt)


    print(answer)


import requests
def get_supported_chat_models():
    # 1. Direct API approach is often more reliable for 'Provider' metadata
    # We ask for all models where inference_provider is enabled
    url = "https://huggingface.co/api/models"
    params = {
        "pipeline_tag": "text-generation",
        "other": "conversational",
        # This is the "magic" filter that finds models hosted by providers
        "inference_provider": "all", 
        "sort": "downloads",
        "direction": -1,
        "limit": 20
    }
    response = requests.get(url, params=params)
    if response.status_code != 200:
        print("Failed to fetch models")
        return []
    
    models = response.json()


    cleaned = [
        {
            "id": m.get("id"),
            "downloads": m.get("downloads", 0),
        }
        for m in models
    ]
    print(f"valid list: {cleaned}")
    return cleaned