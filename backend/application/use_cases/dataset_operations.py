


from numpy import rint
from sqlalchemy.orm import Session
from sympy import content

from api.core.config import settings

from application.factories.DatasetFactory import  PUBLIC_DATASETS, get_current_dataset
from application.factories.service_factory import get_service
from application.factories.AccountFactory import get_current_account
from application.repositories.datasetRepository import DatasetRepositoryDb
from application.exceptions import ERRORS_LAYERS, ApplicationError



from domain.db_models import Dataset, User, DatasetFront
from domain.domain_models.Email import  Email
from domain.domain_models.Requests import  InboxCriteria, TelegramEntityMessageTupleRequest


from infrastructure.encryption.fernet import FernetEncrypter
from infrastructure.ner import entity_extractor
from infrastructure.ner.entity_extractor import extract_entities_from_messages
from infrastructure.storage.dataset_files_repository import FileDatasetRepository








def _validate_new_ds_user(ds_name, user_id, ds_controller: DatasetRepositoryDb):
    """ds_name should not exists for the same user and if IS_PROD then user must not have more than 3 datasets, otherwise throw application error"""

    try:
        ds_exists = ds_controller.check_ds_name(ds_name, user_id)
    except Exception as ex:
        raise ApplicationError(
            "Error validating dataset name",
            ex=ex,
            layer=ERRORS_LAYERS.USECASE_ERROR,
            priority=1,
            details={"ds_name": ds_name, "user_id": user_id}
        )

    if ds_exists:
        raise ApplicationError("Dataset name exists before for the same user", layer=ERRORS_LAYERS.API_ROUTES_ERROR)


    #  I should check that each user has only 3 datasets saved if is_prod is true
    count_ds_user = ds_controller.count_user_datasets(user_id)
    if settings.is_prod and count_ds_user >= settings.allowed_prod_user_ds_num:
        raise ApplicationError(
            f"User has reached the maximum number of datasets allowed. Please delete an existing dataset before creating a new one.",
            layer=ERRORS_LAYERS.API_ROUTES_ERROR,
            details={"user_id": user_id, "current_ds_count": count_ds_user, "allowed_ds_count": settings.allowed_prod_user_ds_num}
        )



    return True


async def save_dataset_content(db: Session,   user_id: int, account_id: int, ds_name: str, criteria: InboxCriteria = None, entity_message_tuples: list[TelegramEntityMessageTupleRequest] =None ) -> DatasetFront:
    """Save email dataset (only en emails). Steps: validate ds name, get emails based on criteria, save encrypted dataset file, insert dataset row into db."""

    #-----------------------------
    # 1- Validate ds name
    #-----------------------------
    ds_controller = DatasetRepositoryDb(db)
    v = _validate_new_ds_user(ds_name, user_id, ds_controller)
    if not v:
        raise ApplicationError("Dataset name validation failed", layer=ERRORS_LAYERS.USECASE_ERROR)




    #-----------------------------
    # 2- Get emails based on criteria
    #-----------------------------
    account = get_current_account(db, account_id, user_id)
    service = get_service(db, account, user_id)

    if account.provider_type == "EMAIL":
        if criteria is None:
            raise ApplicationError(
                "Criteria is required for saving email dataset",
                layer=ERRORS_LAYERS.USECASE_ERROR,
                priority=1,
            )
        uids, total_count = service.get_criteria_ids(criteria, all =True)
        emails = service.get_emails_from_ids(uids)
        content = [em.__dict__ for em in emails if em.language == "en"]



    elif account.provider_type == "MESSAGING" and account.email_provider_id == "TELEGRAM":
        if entity_message_tuples is None:
            raise ApplicationError(
                "entity_message_tuples is required for saving telegram dataset",
                layer=ERRORS_LAYERS.USECASE_ERROR,
                priority=1,
            )
        telegram_service = get_service(db, account, user_id)
        try:
            content =  await telegram_service.get_dataset_messages(entity_message_tuples=entity_message_tuples)
        finally:
            await telegram_service.disconnect()



    else:
        raise ApplicationError(
            "Messaging provider is not implemented yet",
            layer=ERRORS_LAYERS.USECASE_ERROR,
            priority=1,
            details={"account_id": account_id, "account_provider_type": account.provider_type, "account_email_provider_id": account.email_provider_id}
        )




    #-----------------------------
    # 3- save dataset file
    #-----------------------------
    encrypter = FernetEncrypter( settings.backend_secrets_encryption_key.get_secret_value())
    files_repo = FileDatasetRepository(user_id, ds_name, encrypter)
    files_repo.save_dataset(content)




    #-----------------------------
    # 4- Insert into db
    #-----------------------------
    try:
        dataset_type = f"{account.provider_type}_{account.email_provider_id}"
        
        ds_controller = DatasetRepositoryDb(db)
        new_ds = ds_controller.create(
            ds_name = ds_name,
            user_id= user_id,
            file_name = files_repo.ds_path,
            count_emails = len(content),
            dataset_type=dataset_type
        )
        new_ds = DatasetFront._from_dataset(new_ds)
    except Exception as ex:
        files_repo.remove_dataset_files()
        raise ApplicationError(
            "Error creating ds row in dataset table"
            , ex=ex
            , layer=ERRORS_LAYERS.USECASE_ERROR)

    return new_ds

def delete_dataset(db: Session, user_id: int, dataset_id: int):
    """delete dataset files and dataset row in db"""

    ds = get_current_dataset(db, user_id= user_id, dataset_id=dataset_id, load_content=False).get("dataset")

    ds_controller = DatasetRepositoryDb(db)
    encrypter = FernetEncrypter( settings.backend_secrets_encryption_key.get_secret_value())
    files_repo = FileDatasetRepository(user_id, ds.ds_name, encrypter)
    try:
        files_repo.remove_dataset_files()
        ds_controller.delete_dataset(ds.dataset_id)
    except Exception as ex:
        raise ApplicationError(
            "Error removing dataset files", 
            ex = ex,
            layer=ERRORS_LAYERS.USECASE_ERROR,
            only_back_message=f"Failed delete dataset files of dataset_id: {ds.dataset_id}"
        )
    return True

def get_user_datasets(db: Session, current_user: User) -> list[DatasetFront]:
    """Get all datasets of the user + public dataset"""

    ds_controller = DatasetRepositoryDb(db)
    try:
        datasets = ds_controller.get_user_datasets(current_user.user_id)

        user_datasets = [DatasetFront._from_dataset(d) for d in datasets]
        return user_datasets  + PUBLIC_DATASETS
    except Exception as ex:
        raise ApplicationError(
            "Error getting user datasets",
            ex=ex,
            layer=ERRORS_LAYERS.USECASE_ERROR,
            only_back_message=f"Failed to get datasets of user_id: {current_user.user_id}"
        )

def get_ds_keywords_entities(db : Session, user_id : int, dataset_id: int) -> dict:
    """Extract entities from dataset content.

    Returns:
        entities_descriptions: dict - Keys are entity labels and values are descriptions of the entity labels.
        keywords: dict - keys are entity labels and value is dict with keys the entity text and values list of message ids where the entity was found. 

    """

    current_dataset = get_current_dataset(db, user_id = user_id, dataset_id=dataset_id )
    content = current_dataset.get("content")
    text_attribute = current_dataset.get("text_attribute")
    id_attribute = current_dataset.get("id_attribute")
    ds_texts = [item[text_attribute]  for item in content]
    ds_ids = [item[id_attribute]  for item in content]

    entities_res = extract_entities_from_messages(ds_texts, ds_ids)
    return {
        "entities_descriptions": entity_extractor.ENTITY_TYPE_DESCRIPTIONS,
        "keywords": entities_res
    }


def get_html_content(db: Session, user_id: int, dataset_id: int, email_id: str) -> str:
    current_dataset = get_current_dataset(db, user_id = user_id, dataset_id=dataset_id, load_not_only_front=True)
    ds_content = current_dataset["content"]


    if ds_content and len(ds_content) > 0:
        id_type = type(ds_content[0].email_id)

    if id_type == int:
        email_id = int(email_id)

    try:
        email : Email = next((e for e in ds_content if e.email_id == email_id), None)
        email_html = email.content_html if email else None
        return email_html
    except Exception as ex:
        raise ApplicationError(
            "Error getting email html content",
            ex=ex,
            layer=ERRORS_LAYERS.USECASE_ERROR,
            only_back_message=f"Failed to get email html content for email_id: {email_id} in dataset_id: {dataset_id}"
        )