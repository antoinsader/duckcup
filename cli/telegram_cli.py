import sys
import os
import random
from cryptography.fernet import Fernet
from telethon.errors import SessionPasswordNeededError
import asyncio


sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from maillib.core.exceptions import InfrastructureError
from maillib.fetching.telegram_fetcher import TelegramFetcher
from maillib.core.utils.files import get_pkl, save_pkl
from maillib.auth.telegram import TelegramAuthenticator
from maillib.fetching.data_classes import TelegramEntityResult, TelegramMessageResult

os.makedirs("./sessions/", exist_ok=True)
SESSION_FILE = os.path.join("./sessions/", "telegram_session.pkl")
DB_PATH = "sqlite:///./data/sql_app.db"

# Session: phone_number

def _load_session():
    if os.path.exists(SESSION_FILE):
        session = get_pkl(SESSION_FILE)
        if session and session['success']:
            return session
    return None

def _save_session(session_data):
    save_pkl(session_data, SESSION_FILE)

async def auth_flow():
    print(f"--- TELEGRAM AUTH ---")
    print(f"\t In the next steps you will be asked about api_id and api_hash, to get them, go to https://my.telegram.org/auth and login with your phone number")
    print(f"\t Those information would be saved encrypted in {SESSION_FILE} for future use")
    api_id = int(input("API ID: ").strip())
    api_hash = input("API Hash: ").strip()
    phone_number = input("Phone number (+1234567890): ").strip()

    fernet_key = Fernet.generate_key()
    try:
        user_id = random.randint(2,99)
        auth = TelegramAuthenticator(
            db_path=DB_PATH,
            user_id=user_id,
            fernet_encryption_key=fernet_key,
            provider_id="TELEGRAM"
        )
        start_form = auth.start_form()
        state  = start_form['state']
        await auth.auth_start(state, api_id, api_hash, phone_number, user_id)
    except Exception as ex:
        print(f"Error connecting to telegram, please try again later. Exception: ")
        print(ex)
        raise ex
        return
    print(f"We sent you a telegram code to your account, please paste it here:")
    code = input("").strip()
    print(f"Enter your telegram password, if you don't have one, you can leave here empty: ")
    password = input("").strip()
    try:
        account_subject, refresh_token = await auth.verify(state, user_id, code=code, password=password)

    except SessionPasswordNeededError as ex:
        print(f"Password is wrong, enter telegram password: ")
        password = input("").strip()
        account_subject, refresh_token = await auth.verify(state, user_id, code=code, password=password)
    except Exception as ex:
        print(f"Error verifying telegram account: {ex}, exception type: {type(ex)}" )
        raise ex
        return
    print(f"Account subject: {account_subject}")
    session_data = {
        "refresh_token": refresh_token,
        "api_id": api_id,
        "api_hash": api_hash,
        "phone_number": phone_number,
    }

    return session_data

async def show_entities(fetcher):
    entities: list[TelegramEntityResult] = await fetcher.get_entities(limit=10)
    for idx, ent in enumerate(entities):
        print(f"{idx  + 1}- {ent.name} ({ent.type})")
    answer = None
    while not answer or  answer < 1 or answer  > len(entities):
        answer = int(input("Enter the number of the chat you want to see the conversation for: ").strip())
    return entities[answer - 1].id

async def show_messages(fetcher, entity_id, limit):
    messages : list[TelegramMessageResult] = await fetcher.get_messages(entity_id, limit)
    for idx, msg in enumerate(messages):
        print(f"Message-{idx + 1}: (date: {msg.date}), (sender: {msg.sender_username}), (has media: {msg.has_media}):  ")
        print(msg.clean_text)
        print(f"------------------------")

async def main():
    session_data = _load_session()
    if session_data:
        print(f"Session loaded from file {SESSION_FILE} for phone: {session_data['phone_number']}")
        answer = input(" press [y] to continue or [n] to change the number: ").strip().lower()
    if not session_data or answer != 'y':
        session_data = await auth_flow()


    try:
        session_data["success"] = True
        _save_session(session_data)
        refresh_token = session_data['refresh_token']
        fetcher = TelegramFetcher(refresh_token)
        print(f"Account connected")
    except Exception as ex:
        print(f"Error connecting with refresh token, ex: {ex}")
        return

    entity_id = await show_entities(fetcher)
    limit = None
    while not limit or not type(limit) == int or  limit <= 0 or limit  > 200:
        limit = int(input("Put a number of messages between 1 and 200: ").strip())
    await show_messages(fetcher, entity_id, limit)


if __name__ == "__main__":
    try:
        asyncio.run( main())
    except InfrastructureError as inf_ex:
        print(f"Infrastructure error: {inf_ex.ex}" )
    except Exception as ex:
        print(f"Application stopped error: {ex}")