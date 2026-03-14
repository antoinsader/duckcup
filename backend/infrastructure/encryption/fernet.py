from cryptography.fernet import Fernet
from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError
from ._encrypter import Encrypter


class FernetEncrypter(Encrypter):
    def __init__(self, encryption_key):
        secret = encryption_key
        try:
            self.cipher = Fernet(secret.encode())
        except Exception as ex:
            raise InfrastructureError(
                f"Error encoding secret in FERNET",
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
            raise TypeError(f"Unsupported type for encrypt: {type(value)}")
        except Exception as ex:
            raise InfrastructureError(
                "Error encrypting in FERNET",
                layer=INFRA_ERROR_LAYERS.ENCRYPTION,
                priority=1,
                ex=ex
            )

    def decrypt(self, encrypted_value):
        try:
            if isinstance(encrypted_value, str):
                return self.cipher.decrypt(encrypted_value.encode("utf-8")).decode("utf-8")
            if isinstance(encrypted_value, (bytes, bytearray)):
                return self.cipher.decrypt(bytes(encrypted_value))
            raise TypeError(f"Unsupported type for decrypt: {type(encrypted_value)}")
        except Exception as ex:
            raise InfrastructureError(
                "Error decrypting in FERNET",
                layer=INFRA_ERROR_LAYERS.ENCRYPTION,
                priority=1,
                ex=ex
            )