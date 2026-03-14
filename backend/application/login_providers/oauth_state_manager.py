import json
import secrets

from application.exceptions import ERRORS_LAYERS, ApplicationError
from application.repositories.tempKeysRepository import TempSecretsRepository


STATE_TTL_SECONDS = 600


def generate_oauth_state(user_id: int, provider: str) -> str:
    """Generate a state string depedning on user_id, provider_id, save it in the temp secrets."""
    try:
        state = secrets.token_urlsafe(32)
        state_payload = {
            "user_id": user_id,
            "provider": provider,
        }

        temp_key_ser = TempSecretsRepository()
        temp_key_ser.set(
            f"oauth_state:{state}",
            json.dumps(state_payload),
            STATE_TTL_SECONDS,
        )
        return state
    except Exception as ex:
        raise ApplicationError(
            "Could not generate OAuth state",
            layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            ex=ex
        )

def read_oauth_state(state: str) -> dict:
    """Read the state data from temp secrets, return it as dict, or raise error if not found."""
    try:
        temp_key_ser = TempSecretsRepository()
        state_key = f"oauth_state:{state}"
        stored_state = temp_key_ser.get(state_key)
        if not stored_state:
            raise ApplicationError(
                "Could not complete login",
                layer=ERRORS_LAYERS.API_ROUTES_AUTH,
                only_back_message="Invalid or expired OAuth state",
            )
        return json.loads(stored_state)
    except Exception as ex:
        raise ApplicationError(
            "Could not read OAuth state",
            layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            ex=ex
        )


def consume_oauth_state(state: str) -> None:
    """Delete the state from temp secrets, so it can't be used again."""
    try:
        temp_key_ser = TempSecretsRepository()
        state_key = f"oauth_state:{state}"
        temp_key_ser.del_key(state_key)
    except Exception as ex:
        raise ApplicationError(
            "Could not consume OAuth state",
            layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            ex=ex
        )


def validate_oauth_state(state: str, user_id: int, consume: bool = True) -> dict:
    """Validate the state, check if the user_id in the state match the current user, return the provider id if valid. If consume is True, delete the state after validation."""
    state_data = read_oauth_state(state)
    state_provider_id = state_data["provider"]
    state_user_id = state_data["user_id"]
    if state_provider_id is None or state_user_id is None:
        raise ApplicationError(
            "Could not complete login 2",
            layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            only_back_message=f"Invalid OAuth state data: {state_data}",
        )
    if state_user_id != user_id:
        raise ApplicationError(
            "Could not complete login 3",
            layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            priority=1,
            only_back_message=f"current_user: {user_id}, state user_id: {state_user_id}",
        )

    if consume:
        consume_oauth_state(state)
    return state_data
