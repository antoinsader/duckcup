


from api.core.config import settings

from infrastructure.encryption.fernet import FernetEncrypter
from infrastructure.storage.dataset_files_repository import FileDatasetRepository


from domain.domain_models.Email import Email, EmailFront

def get_dataset_emails(user_id:int, ds_name:str):
    encrypter = FernetEncrypter( settings.backend_secrets_encryption_key.get_secret_value())
    files_repo = FileDatasetRepository(user_id, ds_name, encrypter)
    emails = files_repo.load_dataset()
    emails = [EmailFront.from_email(m) for m in emails]

    return emails
