import json
import regex
from telethon import TelegramClient
from telethon.sessions import StringSession
import langid


from maillib.core import ApplicationError, APPLICATION_ERROR_LAYERS, LruCachingMemory
from maillib.fetching import TelegramEntityResult, TelegramMessageResult
from maillib.fetching.utils.regex_patterns import RegexPatterns


_chat_messages_cache = LruCachingMemory(max_size=5, expiration_minutes=10)

class TelegramFetcher:
    def __init__(self, refresh_token: str):
        self._connected = False
        auth_data = json.loads(refresh_token)
        if not {"session", "api_id", "api_hash"}.issubset(auth_data.keys()):
            raise ApplicationError(
                f"Invalid telegram refresh token",
                layer=APPLICATION_ERROR_LAYERS.TELEGRAM_FETCHER,
            )
        self.client = TelegramClient(
            StringSession(auth_data["session"]),
            api_id=auth_data["api_id"],
            api_hash=auth_data["api_hash"],
        )
        self.count_messages = 0

    async def _connect(self):
        if self._connected:
            return
        try:
            await self.client.connect()
            is_auth = await self.client.is_user_authorized()
            if not is_auth:
                raise ApplicationError(
                    f"Telegram session expired, login again",
                    layer=APPLICATION_ERROR_LAYERS.TELEGRAM_AUTHENTICATOR,
                )
            self._connected = True
        except ApplicationError:
            raise
        except Exception as ex:
            raise ApplicationError(
                f"Error connecting to telegram service",
                layer=APPLICATION_ERROR_LAYERS.TELEGRAM_AUTHENTICATOR,
                priority=1,
                ex=ex
            )
    async def _disconnect(self):
        if self.client is None:
            self._connected = False
        if not self._connected:
            return
        try:
            await self.client.disconnect()
        finally:
            self._connected  = False

    def _clean_message_text(self, text):
        """ Clean the message text by removing emojis, tags, and non-ascii characters, and normalizing whitespace.
        Returns (cleaned_text, emojis, tags)
        """
        emojis = regex.findall(r"\X", text)
        emojis = [e for e in emojis if regex.match(r"\p{Emoji}", e)]
        tags = regex.findall(r"#\S+", text)

        text = regex.sub(r"\p{So}", " ", text)
        text = RegexPatterns.NON_ASCI_PATTERN.sub(" ", text)
        lines = [RegexPatterns.MULTIPLE_WHITE_SPACES_PATTERN.sub(" ", line).strip() for line in text.split("\n")]
        text = "\n".join(lines)
        text = RegexPatterns.MULTIPLE_NEWLINES_PATTERN.sub("\n\n", text)
        text = RegexPatterns.MULTIPLE_WHITE_SPACES_PATTERN.sub(" ", text).strip()
        return text.strip(), emojis, tags


    async def get_entities(self, limit:int=100) -> TelegramEntityResult:
        await self._connect()
        dialogs = []
        try:
            async for dialog in self.client.iter_dialogs(limit=limit):
                dialogs.append(
                    TelegramEntityResult(
                        id=dialog.id,
                        name=dialog.name,
                        type='user' if dialog.is_user else 'group' if dialog.is_group else 'channel'
                    )
                )
            return dialogs
        except Exception as ex:
            raise ApplicationError(
                f"Error fetching telegram dialogs iteration",
                APPLICATION_ERROR_LAYERS.TELEGRAM_FETCHER,
                priority=1,
                ex=ex
            )
    async def get_messages(self, entity_id, limit=100):
        cache_key = f"{entity_id}::{limit}"
        cached = _chat_messages_cache.get(cache_key)
        if cached:
            return  cached
        await self._connect()
        try:
            entity = await self.client.get_entity(entity_id)
            messages  = []
            async for message in self.client.iter_messages(entity, limit=limit):
                sender = await message.get_sender() if message.sender_id else None
                if not message.message:
                    continue
                clean_text, emojis, tags = self._clean_message_text(message.message)
                if not clean_text:
                    continue
                language, _ = langid.classify(clean_text)
                sender = await message.get_sender() if message.sender_id else None
                print(f"entity: {entity}")
                print(f"sender: {sender}")
                messages.append(
                    TelegramMessageResult(
                        message_id=message.id,
                        entity_id=entity_id,
                        entity_name=  getattr(entity, "name", getattr(entity, 'title', entity_id))  ,
                        sender_username=getattr(sender, "username", None) if sender else None,
                        date=message.date.isoformat() if message.date else None,
                        text=message.message,
                        clean_text=clean_text,
                        emojis=emojis,
                        tags=tags,
                        language=language,
                        has_media= bool(message.media),
                    )
                )
            _chat_messages_cache.put(cache_key, messages)
            return messages
        except Exception as ex:
            print(ex)
            raise ApplicationError(
                f"Error fetching telegram messages iteration",
                APPLICATION_ERROR_LAYERS.TELEGRAM_FETCHER,
                priority=1,
                ex=ex
            )
