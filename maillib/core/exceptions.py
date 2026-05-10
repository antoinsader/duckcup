from enum import Enum
import logging
from typing import Union


class APPLICATION_WARNING_LAYERS(str, Enum):
    DEPENDENCY = "api_dependency"
class INFRA_WARNING_LAYERS(str, Enum):
    DEPENDENCY = "api_dependency"


class APPLICATION_ERROR_LAYERS(str, Enum):
    GMAIL_AUTHENTICATOR = "app_gmail_authenticator"
    OAUTH_INVALID = "app_oauth"


    DEPENDENCY = "api_dependency"
    ENV_CONFIGURATION = "application_env_configuration"
    EMBEDDING="application_embedding"
    API_SECURITY="api_security"
    AUTHENTICATION="authentication"

    API_ROUTES_ERROR ="api_routes_general"
    API_ROUTES_AUTH ="api_routes_auth"
    API_ROUTES_IMPORTANT ="api_routes_important"

    USECASE_ERROR ="application_use_case"
    USECASE_IMPORTANT ="application_use_case_critical"

    DATASET_FILES = "Dataset_files"
    FACTORIES_CLUSTERING= "application_factories_clustering" 
    APPLICATION_SECRETS= "application_secrets" 
    SUMMARIZATION= "application_summarization" 
    META= "application_meta" 
    AUTOMATIC_EVENT="application_automatic_event"
    ENCRYPTION="application_encryption"
    DATABASE = "application_database"
    LOGIN_PROVIDER = "application_login_provider"

class INFRA_ERROR_LAYERS(str, Enum):
    ENCRYPTION = "infra_encryption"
    CACHING="infra_caching"
    STORAGE="infra_storage"
    SQLITE="infra_sqlite"

    INSTALLING= "infra_installing"
    ENV_CONFIGURATION = "infra_env_configuration"
    BUILD_PROMPT = "infra_build_prompt"
    CLUSTERING = "infra_clustering"
    DIM_REDUCTION = "infra_dim_reduction"
    EMBEDDING = "infra_embedding"
    PROCESSING="infra_processing"
    PROMPTER="infra_prompter"
    REPOSITORIES="infra_repositories"
    SUMMARIZER="infra_summarizer"
    TOKENIZER="infra_tokenizer"
    UTILS = "infra_utils"
    IMAP="infra_email_imap"
    TFIDF="infra_tfidf"
    KEYWORD_EXTRACTION="keyword_extraction"
    NORMALIZER="infra_normalizer"


class ApplicationError(Exception):
    """
        Base class for application-level (and api routes) errors.
    """
    def __init__(self, 
                 front_message: str,
                 layer:APPLICATION_ERROR_LAYERS=None, 
                 priority: int = 3,
                 back_details : Union[str,dict]=None,
                 ex: Exception=None):

        super().__init__(front_message)
        self.front_message = front_message
        self.back_details = back_details
        self.layer = layer.value if layer is not None else None
        self.ex = ex
        self.priority = priority if isinstance(priority, int) and 1 <= priority <= 5 else 3

class NotAuthenticatedError(Exception):
    def __init__(self,
                 front_message:str,
                 layer:APPLICATION_ERROR_LAYERS=None,
                 back_details: Union[str, dict] = None,
                 ex: Exception = None):
        super().__init__(front_message)
        self.front_message = front_message
        self.layer = layer.value if layer is not None else None
        self.details = back_details
        self.ex = ex

class InfrastructureError(Exception):
    """
        Base class for infrastructure-level errors
    """
    def __init__(self,
                 front_message: str,
                 layer: INFRA_ERROR_LAYERS,
                 priority: int = 3,
                 back_details: Union[str, dict] = None,
                 ex: Exception= None
                ):
        super().__init__(front_message)
        self.front_message = front_message
        self.layer = layer.value if layer is not None else None
        self.back_details = back_details
        self.ex = ex
        self.priority = priority if isinstance(priority, int) and 1 <= priority <= 5 else 3


warning_logger = logging.getLogger("warning_logger")
class ApplicationWarning:
    def __init__(self, 
                 front_warning: str,
                 layer: APPLICATION_WARNING_LAYERS = None,
                 details: Union[str, dict] = "",
                ):
        self.warning = front_warning
        self.layer = layer.value if layer is not None else "application_warning"
        self.details = details
        warning_logger.warning(f"Warning {self.layer}: | {front_warning} | {self.details} ")


class InfrastructureWarning:
    def __init__(self, front_warning:str, layer:INFRA_ERROR_LAYERS=None, details: Union[str, dict] = "", ):
        self.front_warning = front_warning
        self.layer = layer.value if layer is not None else "infra_warning"
        self.details = details
        warning_logger.warning(f"Warning {self.layer}: | {front_warning} | {self.details} ")
