from abc import ABC, abstractmethod
from cryptography.fernet import Fernet

from maillib.core.exceptions import INFRA_ERROR_LAYERS, InfrastructureError


class Encrypter(ABC):
    """
    Abstract class for encrypter
    """

    @abstractmethod
    def encrypt(self, value: str) -> str:
        pass

    @abstractmethod
    def decrypt(self, value: str) -> str:
        pass


class FernetEncrypter(Encrypter):
    """
    Implementing Encrypter abstract class
    constructor args:
        encryption_key: str fernet secret
    class properties:
        cipher
    methods:
        encrypt(value : Union[str, bytes, bytearray]) -> bytes
        decrypt(encrypted_value: bytes) -> str

    """
    def __init__(self, encryption_key):
        secret = encryption_key
        try:
            self.cipher = Fernet(secret.encode())
        except Exception as ex:
            raise InfrastructureError(
                f"Error creating Fernet cipher",
                layer=INFRA_ERROR_LAYERS.ENCRYPTION,
                priority=1,
                ex=ex
            )
    def encrypt(self, value):
        try:
            if isinstance(value, str):
                return self.cipher.encrypt(value.encode("utf-8")).decode("utf-8")
            if isinstance(value, (bytes, bytearray)):
                return self.cipher.encrypt(bytes(value))
            raise InfrastructureError(
                f"Unsupported type to encrypt: {type(value)}",
                INFRA_ERROR_LAYERS.ENCRYPTION,
                priority=2,
            )
        except Exception as ex:
            raise InfrastructureError(
                f"Error encrypting FERNET",
                INFRA_ERROR_LAYERS.ENCRYPTION,
                priority=2,
                ex=ex,
                back_details=f"value to encrypt: {value}"
            )
    def decrypt(self, encrypted_value):
        try:
            if isinstance(encrypted_value, str):
                return self.cipher.decrypt(encrypted_value.encode("utf-8")).decode("utf-8")
            if isinstance(encrypted_value, (bytes, bytearray)):
                return self.cipher.decrypt(bytes(encrypted_value))
            raise InfrastructureError(
                f"Unsupported type to decrypt: {type(encrypted_value)}",
                INFRA_ERROR_LAYERS.ENCRYPTION,
                priority=2,
            )
        except Exception as ex:
            raise InfrastructureError(
                f"Error decrypting FERNET",
                INFRA_ERROR_LAYERS.ENCRYPTION,
                priority=2,
                ex=ex,
                back_details=f"value to decrypt: {encrypted_value}"
            )


