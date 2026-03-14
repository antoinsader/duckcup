from abc import ABC, abstractmethod

from application.login_providers.base_provider import Provider, ProviderType


class MessagingProvider(Provider, ABC):
    @property
    def provider_type(self) -> ProviderType:
        return ProviderType.MESSAGING

    @abstractmethod
    def start_login(self, user_id: int, **kwargs) -> dict:
        pass

    @abstractmethod
    def verify_login(self, verification_data: dict, **kwargs) -> dict:
        pass

    @abstractmethod
    def get_user(self, session_data: dict, **kwargs) -> dict:
        pass

    def authenticate(self, user_id: int, **kwargs) -> dict:
        return self.start_login(user_id, **kwargs)

    def get_service(self, credentials: dict, **kwargs):
        return None
