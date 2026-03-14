
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session


from api.core.dependencies import  get_current_user, get_db

from application.use_cases.dataset_operations import delete_dataset, get_ds_keywords_entities, get_user_datasets,get_current_dataset, get_html_content, save_dataset_content

from domain.db_models import User, DatasetMessages
from domain.db_models.Dataset import DatasetFront
from domain.domain_models.Email import EmailFront
from domain.domain_models.Requests import SaveEmailsDatasetRequest, DsEmailRequest, DsRequest, TelegramSaveDatasetRequest





router = APIRouter()



@router.post("/get_user_datasets")
def get_user_datasets_route(current_user : User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List the datasets available to the current user.

    Authentication:
        Required.

    Request Body:
        None.

    Returns:
        items: list - Datasets available to the current user, including public datasets.
    """
    return get_user_datasets(db, current_user)




@router.post("/get_ds_content")
async def get_ds_content_route(payload: DsRequest, user: User = Depends(get_current_user), db: Session=Depends(get_db)) -> list[EmailFront] | list[DatasetMessages]:
    """Return the content stored in one dataset.

    Authentication:
        Required.

    Request Body:
        dataset_id: int - Dataset identifier to read.

    Returns:
        content: list - Dataset entries. Shape depends on dataset type (for example EmailFront or DatasetMessages).
    """
    dataset_id = payload.dataset_id
    return get_current_dataset(db, user_id = user.user_id, dataset_id=dataset_id).get("content")

@router.post("/save_inbox_dataset", response_model=None)
async def save_email_dataset_route(ds_request: SaveEmailsDatasetRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> DatasetFront:
    """Create a dataset from emails selected from one inbox.

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
    """
    account_id = ds_request.account_id
    criteria = ds_request.criteria
    ds_name = ds_request.ds_name
    new_ds = await save_dataset_content(
        db=db,
        user_id= current_user.user_id,
        account_id= account_id,
        ds_name=ds_name,
        criteria=criteria
    )
    return new_ds


@router.post("/save_messages_dataset", response_model=None)
async def save_messages_dataset_route(payload: TelegramSaveDatasetRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> DatasetFront:
    """Create a dataset from selected Telegram messages.

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
    """
    new_ds = await save_dataset_content(
        db=db,
        user_id=user.user_id,
        account_id=payload.account_id,
        ds_name = payload.dataset_name,
        entity_message_tuples=[item.model_dump() for item in payload.entity_message_tuples],
    )
    return new_ds




@router.post("/get_html_content")
async def get_html_content_route(payload: DsEmailRequest, user: User = Depends(get_current_user), db: Session=Depends(get_db)) -> str:
    """Return the HTML content of one email stored in a dataset.

    Authentication:
        Required.

    Request Body:
        dataset_id: int - Dataset identifier that contains the email.
        email_id: str - Email identifier to fetch.

    Returns:
        html_content: str - HTML body of the selected dataset email.
    """
    dataset_id = payload.dataset_id
    email_id = payload.email_id
    return get_html_content(db, user.user_id, dataset_id, email_id)



@router.post("/get_ds_keywords_entities")
def get_ds_keywords_entities_route(payload: DsRequest, user: User = Depends(get_current_user), db: Session=Depends(get_db)) -> dict:
    """Return extract entities from dataset content.
    
    Authentication:
        Required.

    Request Body:
        dataset_id: int - Dataset identifier to analyze.

    Returns:
        entities_descriptions: dict - Keys are entity labels and values are descriptions of the entity labels.
        keywords: dict - keys are entity labels and value is dict with keys the entity text and values list of message ids where the entity was found. 
    """
    dataset_id = payload.dataset_id
    return get_ds_keywords_entities(db, user_id = user.user_id, dataset_id=dataset_id)
    
    

@router.post("/delete_ds")
def delete_ds(payload: DsRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Delete a dataset and its related stored files.

    Authentication:
        Required.

    Request Body:
        dataset_id: int - Dataset identifier to delete.

    Returns:
        success: bool - True when dataset deletion succeeds.
    """
    dataset_id = payload.dataset_id
    success = delete_dataset(db, user_id = current_user.user_id,  dataset_id=dataset_id)
    return {"success": success}


