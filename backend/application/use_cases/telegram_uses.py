
from sqlalchemy.orm import Session
import asyncio


from application.exceptions import ERRORS_LAYERS, ApplicationError
from application.factories.service_factory import get_service
from application.use_cases.accounts import get_current_account
from domain.domain_models import TelegramEntityFront, TelegramMessageFront

from infrastructure.ner.entity_extractor import extract_entities_from_messages, ENTITY_TYPE_DESCRIPTIONS


async def get_entities(db: Session, account_id: int,  user_id: int, limit: int=100) -> list[TelegramEntityFront]:
    """Get senders of telegram chats. Returns [{chat_id: str, chat_name: str, chat_type: str}...]. chat_type can be channel, user, group"""
    account = get_current_account(db, account_id, user_id)
    telegram_service = get_service(db, account, user_id)
    try:
        ents = await telegram_service.get_entities(limit=limit)
        return [TelegramEntityFront._from_TelegramEntityResult(ent) for ent in ents]
    finally:
        await telegram_service.disconnect()

async def get_messages(db: Session, account_id: int,  user_id: int, chat_id: str, limit: int) -> list[TelegramMessageFront]:
    """Get messages from chat of telegram."""
    account = get_current_account(db, account_id, user_id)
    telegram_service = get_service(db, account, user_id)
    try:
        msgs = await telegram_service.get_messages(chat_id=chat_id, limit=limit)
        return [TelegramMessageFront._from_TelegramMessageResult(msg) for msg in msgs]
    finally:
        await telegram_service.disconnect()

async def get_messages_multiple_chats(db: Session, account_id: int,  user_id: int, entities: list[dict]) -> list[TelegramMessageFront]:
    """Get messages from multiple chats of telegram. entities is a list of dict with keys chat_id and limit."""
    account = get_current_account(db, account_id, user_id)
    telegram_service = get_service(db, account, user_id)
    try:
        async def fetch_msgs(entity_info):
            chat_id = entity_info["chat_id"]
            limit = entity_info["limit"]
            return await telegram_service.get_messages(chat_id=chat_id, limit=limit)

        all_msgs_lists = await asyncio.gather(*(fetch_msgs(entity_info) for entity_info in entities))
        all_msgs = []
        for msgs in all_msgs_lists:
            all_msgs.extend(msgs)
        return [TelegramMessageFront._from_TelegramMessageResult(msg) for msg in all_msgs]
    finally:
        await telegram_service.disconnect()

async def analyze_messages(db: Session, account_id: int,  user_id: int, entities: list[dict]) -> dict:
    """Extract entities from messages of telegram entities. 
    Returns dict with keys: analysis_entities, entities_descriptions. entities_descriptions is a dict with keys the entity labels and values description of the entity label. 
        analysis_entities is a dict with keys the entity labels and values dict with keys the entity text and values list of message ids where the entity was found. 
    """
    account = get_current_account(db, account_id, user_id)
    telegram_service = get_service(db, account, user_id)
    try:
        async def fetch_msgs(entity_info):
            chat_id = entity_info["chat_id"]
            limit = entity_info["limit"]
            return await telegram_service.get_messages(chat_id=chat_id, limit=limit)

        # Fetch all messages in parallel
        all_msgs_lists = await asyncio.gather(*(fetch_msgs(entity_info) for entity_info in entities))




        messages_text_id_tuples = []
        for msgs in all_msgs_lists:
            messages_text_id_tuples.extend((msg.clean_text, msg.message_id, msg.sender_id) for msg in msgs if msg.language=="en" and msg.clean_text is not None)

        messages_texts = [msg_tuple[0] for msg_tuple in messages_text_id_tuples]
        messages_ids = [msg_tuple[1] for msg_tuple in messages_text_id_tuples]

        cache_key = ';'.join([(msg_tuple[1],  msg_tuple[2]) for msg_tuple in messages_text_id_tuples])

        result = extract_entities_from_messages(messages_texts, messages_ids, cache_key)

        return {
            "analysis_entities": result,
            "entities_descriptions": ENTITY_TYPE_DESCRIPTIONS
        }
    except Exception as ex:
        raise ApplicationError(
            "Error analyzing Telegram messages",
            ex=ex,
            priority=1,
            layer=ERRORS_LAYERS.API_ROUTES_ERROR
        )
    finally:
        await telegram_service.disconnect()


async def get_message_media(db: Session, account_id: int, user_id: int, chat_id: str, message_id: str) -> dict:
    """Get media of a message. Returns the media content with the right media type and filename in the headers. If no media found, returns 404."""
    account = get_current_account(db, account_id, user_id)
    telegram_service = get_service(db, account, user_id)
    try:
        return await telegram_service.get_message_media(chat_id=chat_id, message_id=message_id)
    finally:
        await telegram_service.disconnect()



