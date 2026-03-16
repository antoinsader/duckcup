from abc import ABC, abstractmethod
from typing import Any


class MessagingService(ABC):
    @abstractmethod
    async def connect(self) -> None:
        pass

    @abstractmethod
    async def get_entities(self, limit: int = 100) -> list[dict[str, Any]]:
        pass

    @abstractmethod
    async def get_messages(self, chat_id: int | str, limit: int = 100) -> list[dict[str, Any]]:
        pass
