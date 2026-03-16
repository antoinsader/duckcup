import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.core.dependencies import get_db, get_current_user
from api.core.config import settings

from application.use_cases.gmail_get import get_gmail_inbox_meta, get_inbox_count, get_inbox_criteria, get_html_content

from domain.domain_models.Requests import AccountRequest, EmailRequest, GmailInboxCriteriaRequest
from domain.domain_models.Email import InboxMeta, InboxCriteriaPageResponse
from domain.db_models import User


router = APIRouter()



@router.post("/get_inbox_meta")
def get_inbox_meta_route(payload: AccountRequest, user: User = Depends(get_current_user), db : Session = Depends(get_db)) -> InboxMeta:
    """Return metadata about the inbox of one connected email account.

    Authentication:
        Required.

    Request Body:
        account_id: int - Connected account identifier to inspect.

    Returns:
        senders_emails: dict[str, str] - Mapping of sender signature to sender email.
        subjects: list[str] - Distinct subjects detected in the inbox sample.
        min_date: str - Oldest email date in the dataset.
        max_date: str - Newest email date in the dataset.
        top_senders: dict[str, int] - Sender frequency summary.
    """
    if settings.testing:
        from application.testing_data import get_testing_inbox_meta
        return get_testing_inbox_meta(payload.account_id)

    account_id = payload.account_id
    meta = get_gmail_inbox_meta(db, account_id, user.user_id)
    return meta





@router.post("/get_inbox_count")
def get_inbox_count_route(payload: AccountRequest, user: User = Depends(get_current_user), db: Session=Depends(get_db)) -> int:
    """Return the number of emails in one connected inbox.

    Authentication:
        Required.

    Request Body:
        account_id: int - Connected account identifier to count.

    Returns:
        count: int - Total emails available in the selected inbox.
    """

    account_id = payload.account_id
    return get_inbox_count(db, account_id, user.user_id)




@router.post("/get_inbox_criteria")
def get_inbox_criteria_route(payload: GmailInboxCriteriaRequest, user: User = Depends(get_current_user), db: Session=Depends(get_db)) -> InboxCriteriaPageResponse:
    """List inbox emails for an account using filter and pagination criteria.

    Authentication:
        Required.

    Request Body:
        account_id: int - Connected account identifier to query.
        criteria: dict - Optional filters with sender_email, subject, date_from, date_to, only_unseen, and sort_by.
        page_num: int - 1-based page number.
        num_rows: int - Page size.
        all: bool - When true, bypass filter criteria.

    Returns:
        items: list[EmailFront] - Paginated email items.
        total_count: int - Total items matching the filter.
        page_num: int - Current page number.
        num_rows: int - Current page size.
    """
    if settings.testing:
        from application.testing_data import get_inbox_criteria_test
        return get_inbox_criteria_test(payload.account_id, payload.criteria)

    account_id = payload.account_id
    criteria = payload.criteria

    inboxCriteriaResponse = get_inbox_criteria(
        db,
        account_id,
        criteria,
        user.user_id,
        payload.page_num,
        payload.num_rows,
        payload.all
    )
    return inboxCriteriaResponse


@router.post("/get_html_content")
async def get_html_content_route(payload: EmailRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> str:
    """Return the HTML body of one email from a connected inbox.

    Authentication:
        Required.

    Request Body:
        account_id: int - Connected account identifier that owns the email.
        email_id: str - Email identifier to fetch.

    Returns:
        html_content: str - HTML body of the selected email.
    """
    account_id = payload.account_id
    email_id = payload.email_id
    return get_html_content(db, account_id, user.user_id, email_id)
