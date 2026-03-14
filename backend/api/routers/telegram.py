from fastapi import APIRouter, Depends,  Response
from sqlalchemy.orm import Session

from api.core.config import settings
from api.core.dependencies import get_db, get_current_user
from application.use_cases.telegram_uses import get_entities, get_messages, analyze_messages, get_message_media, get_messages_multiple_chats
from domain.db_models import User
from domain.domain_models.Requests import TelegramAnalyzeMessagesRequest, TelegramEntitiesRequest, TelegramMessagesRequest, TelegramMessageMediaRequest
from domain.domain_models import TelegramEntityFront, TelegramMessageFront


router = APIRouter()


@router.post("/get_entities")
async def get_entities_route(payload: TelegramEntitiesRequest, user: User = Depends(get_current_user), db : Session = Depends(get_db)) -> list[TelegramEntityFront]:
    """List Telegram chats or entities for a connected account.

    Authentication:
        Required.

    Request Body:
        account_id: int - Connected Telegram account identifier.
        limit: int - Max entities/chats to return.

    Returns:
        items: list[TelegramEntityFront] - Each item typically includes chat_id: str, chat_name: str, and chat_type: str.
    """
    account_id = payload.account_id
    limit = payload.limit

    if settings.testing:
        from application.testing_data import get_testing_telegram_entities
        return get_testing_telegram_entities(account_id)

    meta = await get_entities(db=db, account_id=account_id, user_id = user.user_id, limit=limit)
    return meta


@router.post("/get_messages")
async def get_messages_route(payload: TelegramMessagesRequest, user: User = Depends(get_current_user), db : Session = Depends(get_db)) -> list[TelegramMessageFront]:
    """List messages from one Telegram chat.

    Authentication:
        Required.

    Request Body:
        account_id: int - Connected Telegram account identifier.
        chat_id: str - Chat identifier to read.
        limit: int - Max messages to return.

    Returns:
        items: list[TelegramMessageFront] - Message payloads for the selected chat.
    """
    account_id = payload.account_id
    limit = payload.limit
    chat_id =payload.chat_id
    if settings.testing:
        from application.testing_data import get_testing_telegram_messages
        return get_testing_telegram_messages(account_id, chat_id)

    meta = await get_messages(db=db, account_id=account_id, user_id = user.user_id, chat_id=chat_id, limit=limit)
    return meta

@router.post("/get_messages_multiple_chats")
async def get_messages_multiple_chats_route(payload: TelegramAnalyzeMessagesRequest, user: User = Depends(get_current_user), db : Session = Depends(get_db)) -> list[TelegramMessageFront]:
    """List messages from multiple Telegram chats in one request.

    Authentication:
        Required.
    Request Body:
        account_id: int - Connected Telegram account identifier.
        entities: list[dict] - Each dict containing {chat_id, limit} for the chat to read.
    Returns:
        items: list[TelegramMessageFront] - Message payloads for the selected chats.
    """
    account_id = payload.account_id
    entities = payload.entities
    if settings.testing:
        from application.testing_data import get_testing_telegram_messages_multiple_chats
        return get_testing_telegram_messages_multiple_chats(account_id, entities)

    meta = await get_messages_multiple_chats(db=db, account_id=account_id, user_id = user.user_id, entities=entities)
    return meta

@router.post("/analyze_messages")
async def analyze_messages_route(payload: TelegramAnalyzeMessagesRequest, user: User = Depends(get_current_user), db : Session = Depends(get_db)) -> dict:
    """Analyze entities found in messages from active Telegram chats.

    Authentication:
        Required.

    Request Body:
        account_id: int - Connected Telegram account identifier.
        entities: List[dict] - Each dict containing {chat_id, limit}

    Returns:
        analysis_entities: dict[str, dict[str, list[str]]] - Entity label to entity value to message IDs.
        entities_descriptions: dict[str, str] - Human-readable description per entity label.
    """

    account_id = payload.account_id
    entities = payload.entities
    if settings.testing:
        from application.testing_data import get_testing_telegram_analysis_entities
        return get_testing_telegram_analysis_entities(account_id, entities)

    result = await analyze_messages(db=db, account_id=account_id, user_id = user.user_id, entities=entities)
    return result


@router.post("/get_message_media")
async def get_message_media_route(payload: TelegramMessageMediaRequest, user: User = Depends(get_current_user), db : Session = Depends(get_db)) -> Response:
    """Return the media attached to one Telegram message.

    Authentication:
        Required.

    Request Body:
        account_id: int - Connected Telegram account identifier.
        chat_id: str - Chat identifier containing the message.
        message_id: str - Message identifier with media.

    Returns:
        Binary response body with media bytes.
        Headers include Content-Type and inline filename via Content-Disposition.
    """
    

    account_id = payload.account_id
    chat_id = payload.chat_id
    message_id = payload.message_id
    result = await get_message_media(
        db=db,
        account_id=account_id,
        user_id=user.user_id,
        chat_id=chat_id,
        message_id=message_id,
    )
    filename = result.get("filename", "telegram_media")
    mime_type = result.get("mime_type", "application/octet-stream")
    content = result.get("content")
    headers = {"Content-Disposition": f'inline; filename="{filename}"'}
    return Response(content=content, media_type=mime_type, headers=headers)
