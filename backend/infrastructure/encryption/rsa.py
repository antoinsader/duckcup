import os
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
import base64



from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError
from api.core.config import settings


def generate_key_pairs(dir_to_save:str = "./data/rsa_keys"):
    try:
        dir_to_save= settings.rsa_keys_dir
        os.makedirs(dir_to_save, exist_ok=True)
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        public_key = private_key.public_key()


        private_key_path = os.path.join(dir_to_save, "private_key.pem")
        public_key_path = os.path.join(dir_to_save, "public_key.pem")

        with open(private_key_path, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))

        with open(public_key_path, "wb") as f:
            f.write(public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ))
    except Exception as ex:
        raise InfrastructureError(
            f"Error generating rsa pair keys",
            layer=INFRA_ERROR_LAYERS.ENCRYPTION,
            ex=ex
        )
def decrypt_rsa_value(encrypted):
    try:
        dir_to_save= settings.rsa_keys_dir
        private_key_path = os.path.join(dir_to_save, "private_key.pem")
        with open(private_key_path, "rb") as f:
            private_key = serialization.load_pem_private_key(
                f.read(),
                password=None
            )
            ciphertext = base64.b64decode(encrypted)
            plaintext = private_key.decrypt(
                ciphertext,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            return plaintext.decode()
    except Exception as ex:
        raise InfrastructureError(
            f"Error decrypting using rsa",
            layer=INFRA_ERROR_LAYERS.ENCRYPTION,
            ex=ex
        )


def get_rsa_public_key():
    """Get rsa public key from the application. The key will be used in front-end to decrypt."""
    rsa_keys_dir = settings.rsa_keys_dir
    try:
        path = os.path.join(rsa_keys_dir, "public_key.pem")
        with open(path, "r") as f:
            return f.read()
    except Exception as ex:
        raise InfrastructureError(
            "Failed to read public rsa key",
            layer=INFRA_ERROR_LAYERS.ENCRYPTION,
            only_back_message=f"path: {rsa_keys_dir}",
            ex=ex
        )
