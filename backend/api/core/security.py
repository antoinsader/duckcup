from typing import Optional
from datetime import datetime, timedelta
from jose import jwt

from application.exceptions import ERRORS_LAYERS, ApplicationError, NotAuthenticatedError
from .config import settings

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
        Create local app token using jwt from the data which would be the body of user
    """

    try:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now() + expires_delta
        else:
            expire = datetime.now() + timedelta(minutes=120)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode,  settings.jwt_secret_key.get_secret_value(), algorithm= "HS256")
        return encoded_jwt
    except Exception as ex:
        raise ApplicationError(
            "Error creating access token", 
            ex=ex, 
            layer=ERRORS_LAYERS.API_SECURITY
            )



def verify_token(token: str):
    """
        Verify passed token if it is valid and returns the payload
    """

    try:
        payload = jwt.decode(token,  settings.jwt_secret_key.get_secret_value(), algorithms=["HS256"])
        return payload
    except jwt.JWTError as ex:
        raise NotAuthenticatedError(
            "JWT TOKEN Error validation jwt token 1", 
            layer=ERRORS_LAYERS.AUTHENTICATION , 
            ex=ex)
    except Exception as ex:
        raise NotAuthenticatedError(
            "JWT TOKEN Error validation jwt token 2", 
            layer=ERRORS_LAYERS.AUTHENTICATION , 
            ex=ex)
