

import os
import ssl
from imapclient import IMAPClient
import requests

from ..db import get_db_session
from domain.db_models.Accont import Account, AccountFront

from application.repositories.accountsRepository import AccountsRepositoryControllerDb
from infrastructure.encryption.fernet import FernetEncrypter

from application.login_providers.login_provider import EmailsProviders

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./data/email_app_db.db")
BACKEND_SECRETS_ENCRYPTION_KEY = os.environ.get("BACKEND_SECRETS_ENCRYPTION_KEY")
CLIENT_ID     = os.environ.get("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")


def main():
    db = get_db_session()

    user_id = 1
    encrypter = FernetEncrypter(BACKEND_SECRETS_ENCRYPTION_KEY)
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    if not accounts:
        print("No accounts found for user_id=1")
        return


    account = accounts[0]
    providers = EmailsProviders()
    provider = providers.get_provider_from_id(account.email_provider_id)
    refresh_token = encrypter.decrypt(account.refresh_token)
    access_token = providers.get_access_from_refresh(account.email_provider_id, refresh_token)
    # response = requests.post(
    #     "https://oauth2.googleapis.com/token",
    #     data={
    #         "client_id":     CLIENT_ID,
    #         "client_secret": CLIENT_SECRET,
    #         "refresh_token": access_token,
    #         "grant_type":    "refresh_token",
    #     }
    # )
    # print(response.json())    

    context = ssl.create_default_context()
    context.check_hostname  = False
    context.verify_mode = ssl.CERT_NONE
    imap_client = IMAPClient(provider.host, ssl=True, ssl_context=context)
    imap_client.oauth2_login(account.email, access_token)
    imap_client.select_folder("INBOX")
    status = imap_client.folder_status("INBOX", ["MESSAGES"])
    count = status[b"MESSAGES"]
    print(f"✅ Successfully connected to {account.email} with {count} messages in INBOX")    