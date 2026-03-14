
"""Database setup and session management for the API."""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .config import settings
from application.exceptions import InfrastructureError, INFRA_ERROR_LAYERS

def create_db_engine(database_url: str):
    try:
        connect_args = {"check_same_thread": False} if "sqlite" in database_url else {}
        return create_engine(database_url, connect_args=connect_args)
    except Exception as ex:
        raise InfrastructureError(
            "Failed to create database engine",
            layer=INFRA_ERROR_LAYERS.ENV_CONFIGURATION,
            priority=1,
            ex=ex
        )

def create_session_factory(engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def setup_db():
    try:
        engine = create_db_engine(settings.database_url)
        Base.metadata.create_all(bind=engine)
    except Exception as ex:
        raise InfrastructureError(
            "Failed to initialize database schema",
            layer=INFRA_ERROR_LAYERS.ENV_CONFIGURATION,
            priority=1,
            ex=ex
        )
