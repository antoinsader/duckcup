


from api.core.config import settings
from api.core.db import Base, create_db_engine, create_session_factory
from application.factories.service_factory import get_email_service
from domain.domain_models.Email import EmailFront
from domain.domain_models.Requests import InboxCriteria
from infrastructure.email.email_imap_service import EmailParsingHelper
from domain.db_models.Accont import Account


def get_db_test():
    engine = create_db_engine(settings.test_database_url)
    SessionLocal = create_session_factory(engine)
    db = SessionLocal()
    Base.metadata.create_all(bind=engine)
    return db


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


def get_test_accounts(test_db):
    test_db = get_db_test()
    accounts = test_db.query(Account).all()
    test_db.close()
    return accounts

def main():
    test_db = get_db_test()
    # merge_from_original_to_test_db(test_db)
    accounts = get_test_accounts(test_db)
    print(f"Account 1 email in test db: {accounts[0].email if accounts else 'No accounts found'}")
    print(f"Account 1 refresh token in test db: {accounts[0].refresh_token if accounts else 'No accounts found'}")
    account = accounts[0] if accounts else None
    if not account:
        print("No accounts found in test db after merge.")
        return
    criteria = InboxCriteria(sort_by="newest_first")
    gmail_service = get_email_service(test_db, account, account.user_id)
    uids, _ = gmail_service.get_criteria_ids(criteria, 1, 50)
    data = gmail_service.imap_client.fetch(uids, ['RFC822'])
    
    emails = [EmailParsingHelper.get_email(d[b'RFC822'], uid) for uid , d in data.items()]
    
    for em in emails:
        if em is not None:
            print(type(em), em.__class__)
            print(f"em:  email flags: {em.flags}")
            em   = EmailFront._from_Email(em)
            print(f"em front:  email uid: {em.email_id}, sender email: {em.sender_email}, subject: {em.subject}")
            break