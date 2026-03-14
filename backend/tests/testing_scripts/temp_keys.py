from application.repositories.tempKeysRepository import TempSecretsRepository


def test_temp_keys():
    secret_key= "hello"
    data = {"user_id": 1}

    temp_secret_service = TempSecretsRepository()
    temp_secret_service.set(secret_key, data, 600)

    val = temp_secret_service.get(secret_key)
    print(val)
