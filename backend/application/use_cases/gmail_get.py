from sqlalchemy.orm import Session
from application.exceptions import ERRORS_LAYERS, ApplicationError
from application.factories.service_factory import get_service
from application.use_cases.accounts import get_current_account
from domain.domain_models.Email import EmailFront, InboxMeta, InboxCriteriaPageResponse
from domain.domain_models.Requests import InboxCriteria


from infrastructure.cache.cache_store import InMemoryLruCache


_email_messages_cache = InMemoryLruCache(max_size=256, expiration_minutes=10)
_email_inbox_meta_cache= InMemoryLruCache(max_size=20, expiration_minutes=10)

def get_gmail_inbox_meta(db: Session, account_id: int,  user_id: int) -> InboxMeta:
    """Get meta informations about user's emails inbox

    Parameters:
    -------------
    db: Session
        Database session to get refresh token from account.
    account: Account

    Returns:
    -----------
    InboxMeta: dict
        including senders_names, senders_emails, subjects, min_date, max_date
    """
    account = get_current_account(db, account_id, user_id)
    
    cache_key = f"inbox_meta_{account_id}_{user_id}"
    cached_meta = _email_inbox_meta_cache.get(cache_key)
    if cached_meta is not None:
        return cached_meta
    
    gmail_service = get_service(db, account, user_id)
    uids = gmail_service.get_all_inbox_ids()
    meta = gmail_service.get_meta_from_ids(uids)
    _email_inbox_meta_cache.set(cache_key, meta)
    return meta




def get_inbox_count(db: Session, account_id: int, user_id: int) -> int:
    """
    Raises:
    ---------------------
    ApplicationError
        Layer USECASE_ERROR, if something went wrong
    """
    try:
        account = get_current_account(db, account_id, user_id)
        gmail_service = get_service(db, account, user_id)
        return gmail_service.count
    except Exception as ex:
        raise ApplicationError(
            f"Error loading gmail count",
            layer=ERRORS_LAYERS.USECASE_ERROR,
            only_back_message="Error while trying to load gmail count",
            ex=ex
        )



def get_inbox_criteria(
    db: Session,
    account_id: int,
    criteria: InboxCriteria,
    user_id: int,
    page_num: int = None,
    num_rows: int = None,
    all: bool = False
) -> InboxCriteriaPageResponse:
    """Get emails from inbox of account based on passed criteria. If all is true, ignores criteria and gets all emails in inbox."""

    account = get_current_account(db, account_id, user_id)

    criteria_cache_key = criteria.to_cache_key()
    cache_key=  f"criteria_{criteria_cache_key}_page_{page_num}_numrows_{num_rows}_all_{all}_account_{account_id}_user_{user_id}"
    cached_result = _email_messages_cache.get(cache_key)
    if cached_result is not None:
        return cached_result
    
    gmail_service = get_service(db, account, user_id)

    uids, total_count = gmail_service.get_criteria_ids(criteria, page_num, num_rows, all)

    emails = gmail_service.get_emails_from_ids(uids)
    emails_front = [EmailFront._from_Email(email) for email in emails]
    


    res =  InboxCriteriaPageResponse(
        items=emails_front,
        total_count=total_count,
        page_num=page_num,
        num_rows=num_rows,
    )
    
    _email_messages_cache.set(cache_key, res)
    return res


def get_html_content(db: Session, account_id: int, user_id: int, email_id: int) -> str:
    """Get parsed html content for a specific email id."""
    try:
        account = get_current_account(db, account_id, user_id)
        gmail_service = get_service(db, account, user_id)
        return gmail_service.get_html_content_from_id(email_id)
    except Exception as ex:
        raise ApplicationError(
            "Error loading html content",
            layer=ERRORS_LAYERS.USECASE_ERROR,
            only_back_message="Error while trying to load html content",
            ex=ex
        )
