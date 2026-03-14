

from .db_models.Dataset import Dataset
from .db_models.User import User
from .db_models.UserKeys import UserKeys
from .domain_models.Email import Email
from .domain_models.Requests import *

__all__ = [
    'Dataset'
    'User',
    'Email',
    'UserKeys',
]

# domain entity construction (domain instantiation)


# What problem does this software exist to solve?
# It contains:
    # Entities (Email, User, Dataset)
    # Core rules
    # Business concepts
    # Invariants
# It does NOT know:
    # FastAPI
    # Gmail
    # SQLite
    # HTTP
    # File systems