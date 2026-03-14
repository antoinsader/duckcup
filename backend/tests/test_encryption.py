"""Unit tests for FernetEncrypter (infrastructure/encryption/fernet.py)."""
import pytest
from cryptography.fernet import Fernet

from infrastructure.encryption.fernet import FernetEncrypter
from application.exceptions import InfrastructureError


@pytest.fixture()
def encrypter():
    key = Fernet.generate_key().decode()
    return FernetEncrypter(key)


class TestFernetEncrypterInit:
    def test_valid_key_creates_instance(self):
        key = Fernet.generate_key().decode()
        enc = FernetEncrypter(key)
        assert enc is not None

    def test_invalid_key_raises_infrastructure_error(self):
        with pytest.raises(InfrastructureError):
            FernetEncrypter("not-a-valid-fernet-key")

    def test_empty_key_raises_infrastructure_error(self):
        with pytest.raises(InfrastructureError):
            FernetEncrypter("")


class TestFernetEncrypterEncrypt:
    def test_encrypt_string_returns_string(self, encrypter):
        result = encrypter.encrypt("hello world")
        assert isinstance(result, str)

    def test_encrypt_bytes_returns_bytes(self, encrypter):
        result = encrypter.encrypt(b"hello bytes")
        assert isinstance(result, bytes)

    def test_encrypt_produces_different_ciphertext_each_call(self, encrypter):
        """Fernet tokens include a random IV — same plaintext yields different tokens."""
        c1 = encrypter.encrypt("same text")
        c2 = encrypter.encrypt("same text")
        assert c1 != c2

    def test_encrypt_unsupported_type_raises_infrastructure_error(self, encrypter):
        with pytest.raises(InfrastructureError):
            encrypter.encrypt(12345)  # type: ignore[arg-type]


class TestFernetEncrypterDecrypt:
    def test_decrypt_string_roundtrip(self, encrypter):
        plaintext = "super secret value"
        assert encrypter.decrypt(encrypter.encrypt(plaintext)) == plaintext

    def test_decrypt_bytes_roundtrip(self, encrypter):
        plaintext = b"binary secret"
        assert encrypter.decrypt(encrypter.encrypt(plaintext)) == plaintext

    def test_decrypt_invalid_token_raises_infrastructure_error(self, encrypter):
        with pytest.raises(InfrastructureError):
            encrypter.decrypt("this-is-not-a-valid-token")

    def test_decrypt_tampered_token_raises_infrastructure_error(self, encrypter):
        token = encrypter.encrypt("sensitive")
        tampered = token[:-4] + "XXXX"
        with pytest.raises(InfrastructureError):
            encrypter.decrypt(tampered)

    def test_decrypt_with_different_key_raises_infrastructure_error(self):
        enc1 = FernetEncrypter(Fernet.generate_key().decode())
        enc2 = FernetEncrypter(Fernet.generate_key().decode())
        token = enc1.encrypt("secret")
        with pytest.raises(InfrastructureError):
            enc2.decrypt(token)

    def test_decrypt_unsupported_type_raises_infrastructure_error(self, encrypter):
        with pytest.raises(InfrastructureError):
            encrypter.decrypt(99999)  # type: ignore[arg-type]
