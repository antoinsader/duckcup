

from sqlalchemy.orm import Session

from api.core.config import settings
from application.exceptions import ERRORS_LAYERS, ApplicationError
from application.repositories.userKeysRepository import UserKeysRepositoryDb
from infrastructure.encryption.fernet import FernetEncrypter
from infrastructure.prompter.huggingface import HuggingFacePrompter, HuggingFacePrompterConfig
from infrastructure.prompter.pollinations import PollinationPrompter, PollinationsPrompterConfig


def get_prompter(db: Session,  user_id: int, prompter_name="pollination", model="qwen-safety"):
    encryption_service = FernetEncrypter(settings.backend_secrets_encryption_key.get_secret_value())
    repo = UserKeysRepositoryDb(db, encryption_service)
    if prompter_name == "hugging_face":
        return HuggingFacePrompter(
            HuggingFacePrompterConfig(
                hf_token=repo.get_user_key(key_name='hugging_face_key',  user_id=user_id) ,
                model  = model,
            )
        )
    elif prompter_name == "pollination":
        return PollinationPrompter(
            PollinationsPrompterConfig(
                pollination_key= repo.get_user_key(key_name='pollination_key',  user_id=user_id),
                model=model,
            )
        )
    else:
        raise ApplicationError(
            f"Provider {prompter_name} not supported for title generation",
            layer=ERRORS_LAYERS.API_ROUTES_ERROR,
            priority=2
        )
