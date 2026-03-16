import asyncio
import json
from typing import Any

import langid
import regex
from telethon import TelegramClient
from telethon.sessions import StringSession

from api.core.config import settings
from application.exceptions import ERRORS_LAYERS, ApplicationError
from domain.domain_models import  TelegramEntityResult, TelegramMessageResult

from infrastructure.email.email_imap_service import MULTIPLE_WHITE_SPACES_PATTERN, MULTIPLE_NEWLINES_PATTERN, NON_ASCI_PATTERN

from infrastructure.cache.cache_store import InMemoryLruCache
from .messaging_service import MessagingService


_chat_messages_cache = InMemoryLruCache(max_size=5, expiration_minutes=10)



class TelegramTokenException(ApplicationError):
    def __init__(self, message: str, details: dict[str, Any] = None, ex: Exception = None):
        super().__init__(
            message,
            layer=ERRORS_LAYERS.LOGIN_PROVIDER,
            details=details,
            ex=ex,
            only_back_message="Telegram authentication failed",
        )


class TelegramServiceHelper:
    @staticmethod
    def clean_message_text(text : str) -> tuple[str, list[str], list[str]]:
        """ Clean the message text by removing emojis, tags, and non-ascii characters, and normalizing whitespace.
        Returns (cleaned_text, emojis, tags)
        """

        emojis = regex.findall(r"\X", text)
        emojis = [e for e in emojis if regex.match(r"\p{Emoji}", e)]
        tags = regex.findall(r"#\S+", text)

        text = regex.sub(r"\p{So}", " ", text)
        text = NON_ASCI_PATTERN.sub(" ", text)
        lines = [MULTIPLE_WHITE_SPACES_PATTERN.sub(" ", line).strip() for line in text.split("\n")]
        text = "\n".join(lines)
        text = MULTIPLE_NEWLINES_PATTERN.sub("\n\n", text)
        text = MULTIPLE_WHITE_SPACES_PATTERN.sub(" ", text).strip()
        return text.strip(), emojis, tags

class TelegramMessagingService(MessagingService):
    def __init__(self, refresh_token: str):
        self.client: TelegramClient | None = None
        self._connected = False


        self.auth_data = self._parse_auth_data(refresh_token)
        self.client = TelegramClient(
            StringSession(self.auth_data["session"]),
            api_id=self.auth_data["api_id"],
            api_hash=self.auth_data["api_hash"],
        )
        self.count = 0
        self._try_connect_in_init()

    def _parse_auth_data(self, refresh_token: str) -> dict:
        try:
            auth_data = json.loads(refresh_token)
        except Exception as ex:
            raise TelegramTokenException(
                "Telegram login session is invalid, please login again",
                ex=ex,
            )

        required = {"session", "api_id", "api_hash"}
        if not required.issubset(auth_data.keys()):
            raise TelegramTokenException(
                "Telegram login session is invalid, please login again",
            )
        return auth_data

    def _try_connect_in_init(self) -> None:
        try:
            asyncio.get_running_loop()
            return
        except RuntimeError:
            pass

        try:
            asyncio.run(self.connect())
        except Exception as ex:
            print(f"Telegram connection failed during init: {str(ex)}")
            raise TelegramTokenException(
                "Telegram session expired, please login again",
                ex=ex,
            )

    async def connect(self) -> None:
        if self.client is None:
            raise ApplicationError(
                "Telegram client was not initialized",
                layer=ERRORS_LAYERS.LOGIN_PROVIDER,
            )

        if self._connected:
            return

        try:
            await self.client.connect()
            is_auth = await self.client.is_user_authorized()
            if not is_auth:
                raise ApplicationError(
                    "Telegram session expired, please login again",
                    layer=ERRORS_LAYERS.LOGIN_PROVIDER,
                    only_back_message=f"Telegram client unauthorized",
                )
            self._connected = True
        except ApplicationError:
            raise
        except Exception as ex:
            raise ApplicationError(
                "Telegram session expired, please login again",
                layer=ERRORS_LAYERS.LOGIN_PROVIDER,
                ex=ex,
            )

    async def disconnect(self) -> None:
        if self.client is None:
            self._connected = False
            return

        if not self._connected:
            return

        try:
            await self.client.disconnect()
        finally:
            self._connected = False

    async def get_dataset_messages(self, entity_message_tuples: list[dict[str, str]]) -> list[dict[str, str]]:
        await self.connect()

        entity_cache: dict[int | str, Any] = {}
        entity_name_cache: dict[int | str, str | None] = {}
        rows: list[dict[str, str]] = []

        async for dialog in self.client.iter_dialogs():
            entity_cache[dialog.id] = dialog.entity
            entity_name_cache[dialog.id] = dialog.name

        for item in entity_message_tuples:
            entity_id_raw = str(item.get("entity_id", "")).strip()
            message_id_raw = str(item.get("message_id", "")).strip()

            if not entity_id_raw or not message_id_raw:
                continue

            if not message_id_raw.isdigit():
                continue
            message_id_value = int(message_id_raw)

            entity_key: int | str
            if entity_id_raw.lstrip("-").isdigit():
                entity_key = int(entity_id_raw)
            else:
                entity_key = entity_id_raw

            resolved_entity = entity_cache.get(entity_key)
            entity_name = entity_name_cache.get(entity_key)

            if resolved_entity is None:
                try:
                    resolved_entity = await self.client.get_entity(entity_key)
                except Exception:
                    continue

            if entity_name is None:
                entity_name = (
                    getattr(resolved_entity, "title", None)
                    or getattr(resolved_entity, "username", None)
                    or " ".join(
                        part for part in [
                            getattr(resolved_entity, "first_name", None),
                            getattr(resolved_entity, "last_name", None),
                        ] if part
                    ).strip()
                    or None
                )

            try:
                message = await self.client.get_messages(resolved_entity, ids=message_id_value)
            except Exception:
                continue

            if not message:
                continue

            message_text = message.message
            if not message_text:
                continue

            message_clean_text, emojis, tags = TelegramServiceHelper.clean_message_text(message_text) if message_text else (None, None, None)
            if not message_clean_text:
                continue

            language, _ = langid.classify(message_clean_text)
            if language != "en":
                continue

            sender = await message.get_sender() if message.sender_id else None
            rows.append(
                {
                    "message_id": message.id,
                    "entity_id": str(entity_id_raw),
                    "entity_name": entity_name,
                    "message_date": message.date.isoformat() if message.date else None,
                    "message_text": message_text,
                    "message_clean_text": message_clean_text,
                    "sender_username": getattr(sender, "username", None) if sender else None,
                    "emojis": " ".join(emojis) if emojis else None,
                    "tags": " ".join(tags) if tags else None,
                }
            )

        return rows

    async def get_entities(self, limit: int = 100) -> list[TelegramEntityResult]:
        await self.connect()
        dialogs: list[TelegramEntityResult] = []
        async for dialog in self.client.iter_dialogs(limit=limit):
            dialogs.append(
                TelegramEntityResult(
                    id= dialog.id,
                    name= dialog.name,
                    is_user= dialog.is_user,
                    is_group= dialog.is_group,
                    is_channel= dialog.is_channel,
                )
            )
        return dialogs

    async def get_messages(self, chat_id: int | str, limit: int = 100) -> list[TelegramMessageResult]:
        await self.connect()

        entity: Any = chat_id
        if chat_id in _chat_messages_cache:
            return _chat_messages_cache.get(chat_id)
        

        if isinstance(chat_id, str):
            stripped = chat_id.strip()
            if stripped.lstrip("-").isdigit():
                entity = int(stripped)
            else:
                entity = stripped

        if isinstance(entity, int):
            resolved_entity = None
            async for dialog in self.client.iter_dialogs():
                if dialog.id == entity:
                    resolved_entity = dialog.entity
                    break

            if resolved_entity is not None:
                entity = resolved_entity
            else:
                try:
                    entity = await self.client.get_entity(entity)
                except Exception as ex:
                    raise ApplicationError(
                        f"Could not resolve chat/user id {entity}. Use an ID returned by get_entities or a valid username.",
                        layer=ERRORS_LAYERS.LOGIN_PROVIDER,
                        ex=ex,
                    )
        elif isinstance(entity, str):
            try:
                entity = await self.client.get_entity(entity)
            except Exception as ex:
                raise ApplicationError(
                    f"Could not resolve chat username or invite reference '{entity}'.",
                    layer=ERRORS_LAYERS.LOGIN_PROVIDER,
                    ex=ex,
                )

        results: list[TelegramMessageResult] = []
        async for message in self.client.iter_messages(entity, limit=limit):
            sender = await message.get_sender() if message.sender_id else None
            clean_text, emojis, tags = TelegramServiceHelper.clean_message_text(message.message) if message.message else (None, None, None)
            language, _ = langid.classify(clean_text) if clean_text else (None, None)
            results.append(
                TelegramMessageResult(
                    message_id= message.id,
                    date= message.date.isoformat() if message.date else None,
                    text= message.message,
                    clean_text= clean_text,
                    sender_id= message.sender_id,
                    sender_username= getattr(sender, "username", None) if sender else None,
                    views= message.views,
                    forwards= message.forwards,
                    media= bool(message.media),
                    language=language,
                    chat_id= str(chat_id),
                )
            )
        _chat_messages_cache.set(chat_id, results)
        return results

    async def get_message_media(self, chat_id: int | str, message_id: int | str) -> dict[str, Any]:
        await self.connect()

        entity: Any = chat_id
        if isinstance(chat_id, str):
            stripped = chat_id.strip()
            if stripped.lstrip("-").isdigit():
                entity = int(stripped)
            else:
                entity = stripped

        if isinstance(entity, int):
            resolved_entity = None
            async for dialog in self.client.iter_dialogs():
                if dialog.id == entity:
                    resolved_entity = dialog.entity
                    break

            if resolved_entity is not None:
                entity = resolved_entity
            else:
                try:
                    entity = await self.client.get_entity(entity)
                except Exception as ex:
                    raise ApplicationError(
                        f"Could not resolve chat/user id {entity}. Use an ID returned by get_entities or a valid username.",
                        layer=ERRORS_LAYERS.LOGIN_PROVIDER,
                        ex=ex,
                    )
        elif isinstance(entity, str):
            try:
                entity = await self.client.get_entity(entity)
            except Exception as ex:
                raise ApplicationError(
                    f"Could not resolve chat username or invite reference '{entity}'.",
                    layer=ERRORS_LAYERS.LOGIN_PROVIDER,
                    ex=ex,
                )

        msg_id = message_id
        if isinstance(message_id, str):
            stripped_message_id = message_id.strip()
            if not stripped_message_id.isdigit():
                raise ApplicationError(
                    f"message_id must be numeric. Received '{message_id}'.",
                    layer=ERRORS_LAYERS.LOGIN_PROVIDER,
                )
            msg_id = int(stripped_message_id)

        try:
            message = await self.client.get_messages(entity, ids=msg_id)
        except Exception as ex:
            raise ApplicationError(
                f"Could not fetch message {msg_id} in the provided chat.",
                layer=ERRORS_LAYERS.LOGIN_PROVIDER,
                ex=ex,
            )

        if not message:
            raise ApplicationError(
                f"Message {msg_id} was not found in the provided chat.",
                layer=ERRORS_LAYERS.LOGIN_PROVIDER,
            )

        if not message.media:
            raise ApplicationError(
                f"Message {msg_id} does not contain media.",
                layer=ERRORS_LAYERS.LOGIN_PROVIDER,
            )

        file = message.file
        ext = getattr(file, "ext", None) if file else None
        filename = getattr(file, "name", None) if file else None
        if not filename:
            suffix = ext if ext else ""
            filename = f"telegram_{msg_id}{suffix}"

        mime_type = getattr(file, "mime_type", None) if file else None
        if not mime_type:
            mime_type = "application/octet-stream"

        try:
            content = await self.client.download_media(message, file=bytes)
        except Exception as ex:
            raise ApplicationError(
                f"Could not download media for message {msg_id}.",
                layer=ERRORS_LAYERS.LOGIN_PROVIDER,
                ex=ex,
            )

        if not content:
            raise ApplicationError(
                f"Media content is empty for message {msg_id}.",
                layer=ERRORS_LAYERS.LOGIN_PROVIDER,
            )

        return {
            "filename": filename,
            "mime_type": mime_type,
            "content": content,
        }
