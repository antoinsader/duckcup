from abc import ABC, abstractmethod
from enum import Enum
from typing import Any


class ProviderType(str, Enum):
    EMAIL = "EMAIL"
    MESSAGING = "MESSAGING"


class Provider(ABC):
    @property
    @abstractmethod
    def id(self) -> str:
        pass

    @property
    @abstractmethod
    def provider_type(self) -> ProviderType:
        pass

    @abstractmethod
    def authenticate(self, user_id: int, **kwargs) -> dict:
        pass

    @abstractmethod
    def get_service(self, credentials: dict, **kwargs) -> Any:
        pass
