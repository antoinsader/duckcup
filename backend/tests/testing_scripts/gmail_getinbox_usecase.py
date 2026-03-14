



from api.core.config import settings
from api.core.db import Base, create_db_engine, create_session_factory

from application.factories.service_factory import get_service
from application.use_cases.accounts import get_current_account
from application.use_cases.gmail_get import get_inbox_criteria
from domain.db_models.Accont import Account
from domain.domain_models.Email import EmailFront
from domain.domain_models.Requests import InboxCriteria
from infrastructure.utils.pkl import remove_file



def merge_from_original_to_test_db(test_db):
    if settings.database_url == settings.test_database_url:
        raise ValueError(
            "DATABASE_URL and TEST_DATABASE_URL are identical. Refusing to merge to avoid deleting main DB data."
        )

    original_engine = create_db_engine(settings.database_url)
    OriginalSessionLocal = create_session_factory(original_engine)
    original_db = OriginalSessionLocal()


    try:
        # Delete old accounts from test_db
        test_db.query(Account).delete()
        test_db.commit()

        accounts = original_db.query(Account).all()
        print(f"Found {len(accounts)} accounts in original db to merge into test db.")
        for account in accounts:
            copied_account = Account(
                account_id=account.account_id,
                user_id=account.user_id,
                email_provider_id=account.email_provider_id,
                email=account.email,
                refresh_token=account.refresh_token,
            )
            test_db.add(copied_account)

        test_db.commit()
    except Exception:
        test_db.rollback()
        raise
    finally:
        original_db.close()
        test_db.close()


def get_db_test():
    remove_file(settings.test_database_url.replace("sqlite:///", ""))  # Ensure a clean slate for testing
    engine = create_db_engine(settings.test_database_url)
    SessionLocal = create_session_factory(engine)
    db = SessionLocal()
    Base.metadata.create_all(bind=engine)
    return db


def main():
    account_id = 1
    criteria = InboxCriteria(
        sort_by= "newest_first"
    )
    num_rows = 10
    page_num = 1
    user_id = 1

    db = get_db_test()

    merge_from_original_to_test_db(db)


    account = get_current_account(db, account_id, user_id)
    gmail_service = get_service(db, account, user_id)
    uids, total_count = gmail_service.get_criteria_ids(criteria, page_num, num_rows, all)

    emails = gmail_service.get_emails_from_ids(uids)
    emails_front = [EmailFront._from_Email(email) for email in emails]
    print(f"Emails front 1st: {emails_front[0]}")
