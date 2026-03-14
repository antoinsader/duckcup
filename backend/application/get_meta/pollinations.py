import httpx
import requests

from application.exceptions import ERRORS_LAYERS, ApplicationError
from infrastructure.storage.meta_files_repository import META_FILES, MetaFilesRepository




def save_pollinations_text_models() -> None:

    try:
        response = requests.get("https://gen.pollinations.ai/text/models")        
        models = response.json()
        cleaned = []
        for m in models:
            pricing = m.get('pricing')
            name = m.get('name')
            if not pricing or not name:
                continue

            promptTextTokens = pricing.get('promptTextTokens')
            completion_tokens = pricing.get('completionTextTokens')
            text_pricing = "{" + f"'p': {promptTextTokens},  'o':{completion_tokens}" + "}"
            cleaned.append({
                "name": name,
                "pricing": text_pricing
            })

        repo = MetaFilesRepository(META_FILES.POLLINATION_MODELS)
        repo.save_meta_file(cleaned)


    except Exception as e:
        raise ApplicationError(
            f"Error getting hugging face models and save them",
            ex=e,
            layer=ERRORS_LAYERS.META
        )

def get_pollinations_models_data() -> list[dict]:
    """ Get list of pollinations text generation models available for the user, Returns format [{name, pricing: completionTextTokens Currency},...]"""


    try:
        response = requests.get("https://gen.pollinations.ai/text/models")        
        models = response.json()
        cleaned = []
        for m in models:
            pricing = m.get('pricing')
            name = m.get('name')
            if not pricing or not name:
                continue

            completion_tokens = pricing.get('completionTextTokens')
            currency = pricing.get("currency")
            text_pricing = f"{completion_tokens} {currency}"
            cleaned.append({
                "name": name,
                "pricing": text_pricing
            })
        return cleaned
    except Exception as e:
        raise ApplicationError(
            f"Error getting pollinations models data",
            ex=e,
            layer=ERRORS_LAYERS.META
        )
