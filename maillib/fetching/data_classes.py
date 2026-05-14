
from dataclasses import dataclass


@dataclass
class TelegramEntityResult():
    id: int
    name: str
    type: str # user, group, channel


@dataclass
class TelegramMessageResult():
    message_id: int
    entity_id: str | int | None
    entity_name: str  | None
    date: str | None
    text: str | None
    clean_text: str | None
    emojis: str | None
    tags: str | None
    sender_username: str | None
    language: str | None
    has_media: bool