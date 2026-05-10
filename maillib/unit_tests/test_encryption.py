import pytest
from cryptography.fernet import Fernet
from maillib.core.encryption import FernetEncrypter
from maillib.core.exceptions import INFRA_ERROR_LAYERS, InfrastructureError

@pytest.fixture
def valid_key():
    return Fernet.generate_key().decode("utf-8")

@pytest.fixture
def encrypter(valid_key):
    return FernetEncrypter(valid_key)

class TestFernetEncrypter:
    def test_init_with_valid_key(self, valid_key):
        enc = FernetEncrypter(valid_key)
        assert enc.cipher is not None

    def test_init_with_invalid_key(self):
        with pytest.raises(InfrastructureError) as exc_info:
            FernetEncrypter("invalid key")
        assert exc_info.value.layer == INFRA_ERROR_LAYERS.ENCRYPTION

    def test_encrypt_decrypt_str(self, valid_key):
        enc = FernetEncrypter(valid_key)
        to_encode = "hello world"
        encrypted_val = enc.encrypt(to_encode)
        decrypted_val = enc.decrypt(encrypted_val)
        assert to_encode == decrypted_val

    def test_encrypt_decrypt_bytes(self, valid_key):
        enc = FernetEncrypter(valid_key)
        to_encode = "hello world".encode("utf-8")
        encrypted_val = enc.encrypt(to_encode)
        decrypted_val = enc.decrypt(encrypted_val)
        assert to_encode == decrypted_val
