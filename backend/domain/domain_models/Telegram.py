
from dataclasses import dataclass


@dataclass
class TelegramEntityResult():
    id: int
    name: str | None
    is_user: bool
    is_group: bool
    is_channel: bool

@dataclass
class TelegramEntityFront():
    chat_id: str
    chat_name: str | None
    chat_type: str
    @staticmethod
    def _from_TelegramEntityResult(entity: TelegramEntityResult) -> "TelegramEntityFront":
        if entity.is_channel:
            chat_type = "channel"
        elif entity.is_group:
            chat_type = "group"
        elif entity.is_user:
            chat_type = "user"
        else:
            chat_type = "unknown"

        return TelegramEntityFront(
            chat_id= str(entity.id),
            chat_name= entity.name,
            chat_type= chat_type,
        )

@dataclass
class TelegramMessageResult():
    message_id: int
    chat_id: str | None
    date: str | None
    text: str | None
    clean_text: str | None
    sender_id: int | None
    sender_username: str | None
    language: str | None
    views: int | None
    forwards: int | None
    media: bool

@dataclass
class TelegramMessageFront():
    message_id: str
    date: str | None
    text: str | None
    clean_text: str | None
    chat_id: str | None 
    sender_id: str | None
    sender_username: str | None
    views: int | None = None
    forwards: int | None = None
    media: bool | None = None
    language: str | None = "en"

    @staticmethod
    def _from_TelegramMessageResult(message: TelegramMessageResult) -> "TelegramMessageFront":
        sender_id = message.sender_id
        return TelegramMessageFront(
            message_id= str(message.message_id),
            date= message.date,
            text= message.text,
            clean_text= message.clean_text,
            sender_id= str(sender_id) if sender_id is not None else None,
            sender_username= message.sender_username,
            views= message.views,
            forwards= message.forwards,
            media= message.media,
            language= message.language,
            chat_id= message.chat_id,
        )
    