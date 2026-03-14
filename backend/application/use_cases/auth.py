from sqlalchemy.orm import Session

from api.core.security import create_access_token
from application.exceptions import  ERRORS_LAYERS, ApplicationError
from api.core.config import settings
from application.login_providers.login_providers import EmailsProviders
from application.login_providers.oauth_state_manager import validate_oauth_state
from application.repositories.accountsRepository import AccountsRepositoryControllerDb
from application.repositories.userRepository import UserAuthController
from domain.db_models.User import User, User_Front
from domain.db_models.Accont import Account, AccountFront
from domain.domain_models.Requests import UserLoginRequest
from infrastructure.encryption.fernet import FernetEncrypter

def get_all_users(db: Session) -> list[User_Front]:
    controller = UserAuthController(db)
    return controller.get_all_user()

def delete_user(db: Session, user_id: int) -> bool:
    controller = UserAuthController(db)
    return controller.delete_user(user_id)


def login_user(db: Session, username: str, password: str) -> tuple:
    """Check if user exists with username and password. Create access token. Return user, access_token """
    try:
        controller = UserAuthController(db)
        user = controller.get_by_usernamepassword(username, password)
    except Exception as ex:
        raise ApplicationError(
            f"Error validating user",
            layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            priority=1,
            ex = ex
        )

    if not user:
        raise ApplicationError(
            f"Invalid Credentials ",
            layer = ERRORS_LAYERS.API_ROUTES_AUTH,
            only_back_message=f"Wrong password for username: {username}"
        )

    access_token = create_access_token(data={'user_id': user.user_id, 'username': user.username})
    return user, access_token

def register_user(db: Session, register_request: UserLoginRequest) -> tuple:
    """Check if username exists. Create user and access token. Return user, access_token """
    try:
        controller = UserAuthController(db)
        user = controller.check_user_exists(register_request.username)
    except Exception as ex:
        raise ApplicationError(
            f"Error checking username exists",
            layer=ERRORS_LAYERS.API_ROUTES_AUTH,
            priority=1,
            ex = ex
        )
        
    if user:
        raise ApplicationError(
            f"Please choose different username ",
            layer = ERRORS_LAYERS.API_ROUTES_AUTH,
            only_back_message=f"User tried to register with username already exists {register_request.username}"
        )

    try:
        user = controller.create_user(register_request.username, register_request.password)

    except Exception as ex:
        raise ApplicationError(
            f"Error creating user, please try again later! ",
            layer = ERRORS_LAYERS.API_ROUTES_AUTH,
            ex=ex,
            priority=1
        )
    
    access_token = create_access_token(data={'user_id': user.user_id, 'username': user.username})

    return user, access_token


def login_provider_callback(db:Session, provider_code: str, state: str, current_user: User) -> AccountFront:
    """ Create/update_refresh account from the callback
    Workflow:
    ----------
    1- Validate callback
    2- Call exchange code for token
    3- Create acount  for user if account not exists before, if exists update refresh token
    4- Generate jwt token for provider_account_token
    4- return provider_account_token, account
    """
    user_id = current_user.user_id
    state_data = validate_oauth_state(state, user_id)
    provider_id = state_data["provider"]


    encrypter = FernetEncrypter( settings.backend_secrets_encryption_key.get_secret_value())
    acc_repo = AccountsRepositoryControllerDb(db, encrypter)
    providers = EmailsProviders()
    provider = providers.get_provider_from_id(provider_id)

    token_resp = providers.exchange_code_for_tokens(provider.id, provider_code)
    provider_access_token = token_resp.get("access_token")
    provider_refresh_token = token_resp.get("refresh_token")
    email = providers.get_account_email(provider.id, provider_access_token)
    acc_id = acc_repo.account_email_exists(email, current_user.user_id)
    if acc_id:
        account = acc_repo.update_refresh_token(acc_id, provider_refresh_token)
    else:
        account = acc_repo.create(
            user_id,
            provider.id,
            email,
            provider_refresh_token,
            provider_type=provider.provider_type.value,
        )

    return account
