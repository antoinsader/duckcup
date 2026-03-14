import pickle


from infrastructure.encryption.fernet import FernetEncrypter
from infrastructure.utils.pkl import get_pkl, save_pkl

def main():
    plain_text = "Hello, this is a test email."

    encrypter = FernetEncrypter(encryption_key="F-xIGZQJGaVhodLx2YL_lAuXAXgLe-hE9UoSMUjp3wQ=")
    encrypted_text = encrypter.encrypt(plain_text)
    print(f"Encrypted text: {encrypted_text}")
    decrypted_text = encrypter.decrypt(encrypted_text)
    print(f"Decrypted text: {decrypted_text}")

    assert decrypted_text == plain_text, "Decrypted text does not match the original plain text."



    plain_list = [{"id": 1, "content": "Email content 1"}, {"id": 2, "content": "Email content 2"}]
    plain = pickle.dumps(plain_list, protocol=pickle.HIGHEST_PROTOCOL)
    ciphered = encrypter.encrypt(plain)
    save_pkl(ciphered, "./unit_tests/data/test_enc.pkl")

    loaded_ciphered = get_pkl("./unit_tests/data/test_enc.pkl")
    decrypted_plain = encrypter.decrypt(loaded_ciphered)
    decrypted_list = pickle.loads(decrypted_plain)

    print(f"Original list: {plain_list}")
    print(f"Decrypted list: {decrypted_list}")

    assert decrypted_list == plain_list, "Decrypted list does not match the original plain list."


