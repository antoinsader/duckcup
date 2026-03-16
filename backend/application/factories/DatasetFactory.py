
from calendar import c
import os
import pickle

from sqlalchemy.orm import Session
from api.core.config import settings
from application.exceptions import ERRORS_LAYERS, ApplicationError, NotAuthenticatedError
from application.repositories.datasetRepository import DatasetRepositoryDb 
from domain.db_models.Dataset import  Dataset, DatasetMessages, DatasetFront
from domain.domain_models.Email import EmailFront
from domain.enums import DatasetMessagesAnalysisProperties, EmailsAnalysisProperties
from infrastructure.encryption.fernet import FernetEncrypter
from infrastructure.storage.dataset_files_repository import FileDatasetRepository
from infrastructure.utils.pkl import get_pkl


PUBLIC_DATASETS = [
    DatasetFront(
        dataset_id=1024,
        ds_name="Public telegram dataset",
        count_emails=315,
        dataset_type="MESSAGING_TELEGRAM",
        file_name=os.path.join(settings.public_datasets_path, "1024.pkl")
    )
]

def get_public_dataset(load_not_only_front : bool, load_content: bool = True):
    dataset = PUBLIC_DATASETS[0]

    if load_content:
        encrypter = FernetEncrypter( settings.backend_secrets_encryption_key.get_secret_value())
        cipher_text = get_pkl(dataset.file_name)
        plain_text = encrypter.decrypt(cipher_text)
        content = pickle.loads(plain_text)
    else:
        content = None

    if dataset.dataset_type == "MESSAGING_TELEGRAM":
        if content is not None:
            content = [DatasetMessages._from_dict(item) for item in content]
        sender_attribute = DatasetMessagesAnalysisProperties.SENDER_SIGNATURE.value
        text_attribute = DatasetMessagesAnalysisProperties.TEXT.value
        subject_attribute = DatasetMessagesAnalysisProperties.SUBJECT.value
        id_attribute = DatasetMessagesAnalysisProperties.ID.value
        date_attribute = DatasetMessagesAnalysisProperties.DATE.value
    else: # email dataset
        if content is not None and not load_not_only_front:
            content = [EmailFront._from_Email(email) for email in content]
        sender_attribute = EmailsAnalysisProperties.SENDER_SIGNATURE.value
        text_attribute = EmailsAnalysisProperties.TEXT.value
        subject_attribute = EmailsAnalysisProperties.SUBJECT.value
        id_attribute = EmailsAnalysisProperties.ID.value
        date_attribute = EmailsAnalysisProperties.DATE.value

    return {
        "dataset": dataset,
        "content": content,
        "sender_attribute": sender_attribute,
        "text_attribute": text_attribute,
        "subject_attribute": subject_attribute,
        "id_attribute": id_attribute,
        "date_attribute": date_attribute
    }


def get_current_dataset( db:  Session, dataset_id: int, user_id: int, load_content: bool = True, load_not_only_front : bool  = False) -> dict:
    """Make sure that the dataset_id is valid and belongs to the user. Returning dataset content and information. If the dataset_id = 1024, return the public dataset"""
    if dataset_id == 1024:
        return get_public_dataset(load_not_only_front, load_content)

    try:
        dataset_repo = DatasetRepositoryDb(db)
        dataset :Dataset = dataset_repo.get_dataset_by_id(dataset_id)
    except Exception as e:
        raise ApplicationError(
            f"Error getting dataset by id {dataset_id}",
            layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            details={"dataset_id": dataset_id},
            priority=1,
            ex=e
        )

    if not dataset:
        raise ApplicationError(
            f"Dataset was not found",
            layer=ERRORS_LAYERS.DATASET_FILES,
            priority=4,
            details={"dataset_id": dataset_id}
        )
    if dataset.user_id != user_id:
        raise NotAuthenticatedError(
            f"Dataset was not found 2",
            layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            details={"dataset_id": dataset_id},
            only_back_message=f"User {user_id} has tried to access dataset not authorized {dataset_id}"
        )
    if not dataset.file_name or not os.path.exists(dataset.file_name):
        raise ApplicationError(
            f"Dataset file was not found in server",
            layer=ERRORS_LAYERS.DATASET_FILES,
            details={"dataset_id": dataset_id},
            priority=1,
            only_back_message=f"Dataset file name: {dataset.file_name} was not found. dataset_id: {dataset_id}, user_id: {user_id}"
        )

    if load_content:
        encrypter = FernetEncrypter( settings.backend_secrets_encryption_key.get_secret_value())
        files_repo = FileDatasetRepository(user_id, dataset.ds_name, encrypter)
        content = files_repo.load_dataset()
    else:
        content = None

    if dataset.dataset_type == "MESSAGING_TELEGRAM":
        if content is not None:
            try:
                content = [DatasetMessages._from_dict(item) for item in content]
            except Exception as e:
                raise ApplicationError(
                    f"Error parsing telegram dataset content for dataset_id: {dataset_id}",
                    layer=ERRORS_LAYERS.DATASET_FILES,
                    details={"dataset_id": dataset_id},
                    priority=1,
                    ex=e
                )

        sender_attribute = DatasetMessagesAnalysisProperties.SENDER_SIGNATURE.value
        text_attribute = DatasetMessagesAnalysisProperties.TEXT.value
        subject_attribute = DatasetMessagesAnalysisProperties.SUBJECT.value
        id_attribute = DatasetMessagesAnalysisProperties.ID.value
        date_attribute = DatasetMessagesAnalysisProperties.DATE.value

    else: # email dataset 
        if content is not None and not load_not_only_front:
            try:
                content = [EmailFront._from_dict(email) for email in content]
            except Exception as e:
                raise ApplicationError(
                    f"Error parsing email dataset content for dataset_id: {dataset_id}",
                    layer=ERRORS_LAYERS.DATASET_FILES,
                    details={"dataset_id": dataset_id},
                    priority=1,
                    ex=e
                )

        sender_attribute = EmailsAnalysisProperties.SENDER_SIGNATURE.value
        text_attribute = EmailsAnalysisProperties.TEXT.value
        subject_attribute = EmailsAnalysisProperties.SUBJECT.value
        id_attribute = EmailsAnalysisProperties.ID.value
        date_attribute = EmailsAnalysisProperties.DATE.value

    return {
        "dataset": dataset,
        "content": content,
        "sender_attribute": sender_attribute,
        "text_attribute": text_attribute,
        "subject_attribute": subject_attribute,
        "id_attribute": id_attribute,
        "date_attribute": date_attribute
    }


