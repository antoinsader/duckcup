import asyncio
import regex
import re

from api.core.db import create_db_engine, create_session_factory
from api.core.config import settings
from application.repositories.accountsRepository import AccountsRepositoryControllerDb
from infrastructure.email.email_imap_service import EmailParsingHelper
from infrastructure.encryption.fernet import FernetEncrypter
from infrastructure.messaging.telegram_service import TelegramMessagingService
from infrastructure.utils.pkl import get_pkl, save_pkl


async def get_messages(): 
    user_id = 1
    account_id = 2

    original_engine = create_db_engine(settings.database_url)
    OriginalSessionLocal = create_session_factory(original_engine)
    db = OriginalSessionLocal()
    try:
        encrypter = FernetEncrypter(settings.backend_secrets_encryption_key.get_secret_value())
        acc_repo = AccountsRepositoryControllerDb(db, encrypter)
        account = acc_repo.get_by_id(account_id)

        refresh_token = acc_repo.get_refresh_token(account.account_id, user_id)
        telegram_service = TelegramMessagingService(refresh_token)

        msgs = await telegram_service.get_messages(chat_id="-1001161666782", limit=20)
        return [getattr(msg, "text", None) for msg in msgs if getattr(msg, "text", None)]
    finally:
        db.close()

MULTIPLE_WHITE_SPACES_PATTERN = re.compile(r"\s+")
async def main():
    # msgs = await get_messages()
    # save_pkl(msgs, "./data/telegram_messages_draft.pkl")
    # print("Saved messages to telegram_messages_draft.pkl")
    msgs = get_pkl("./data/telegram_messages_draft.pkl")
    msg = msgs[3] + " @hello #world #test 😊"
    print(f"Example message text: {msg}")
    # cleaned =EmailParsingHelper.clean_mail_text(msg)
    emojis = regex.findall(r"\X", msg)
    emojis = [e for e in emojis if regex.match(r"\p{Emoji}", e)]
    tags = regex.findall(r"#\S+", msg)
    print(f"Emojis: {emojis}, Tags: {tags}")