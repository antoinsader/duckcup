
from enum import Enum
import logging
from typing import Union



class ERRORS_LAYERS(str, Enum):
    """
    MUST RENAMAE IT TO APPLICATION_ROUTES_ERROR_LAYERS
    """
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
    """
    MUST RENAMAE IT TO INFRASTRUCTURE_ERROR_LAYERS
    """
    INSTALLING= "infra_installing"
    ENV_CONFIGURATION = "infra_env_configuration"
    BUILD_PROMPT = "infra_build_prompt"
    CLUSTERING = "infra_clustering"
    DIM_REDUCTION = "infra_dim_reduction"
    EMBEDDING = "infra_embedding"
    ENCRYPTION = "infra_encryption"
    PROCESSING="infra_processing"
    PROMPTER="infra_prompter"
    REPOSITORIES="infra_repositories"
    STORAGE="infra_storage"
    SUMMARIZER="infra_summarizer"
    TOKENIZER="infra_tokenizer"
    UTILS = "infra_utils"
    IMAP="infra_email_imap"
    TFIDF="infra_tfidf"
    KEYWORD_EXTRACTION="keyword_extraction"
    NORMALIZER="infra_normalizer"




# THOSE DETAILS NEED TO BE LOGGED IN SOME WAY , maybe in router app using console instead of just print
# AFTER, A MODEL CAN EXTRACT THE IMPORTANT ONES
class ApplicationError(Exception):
    """
        Base class for application-level (and api routes) errors.
    """

    def __init__(self, 
                 message: str,
                 layer:ERRORS_LAYERS=None, 
                 priority: int = 3,
                 details : Union[str,dict]=None,
                 only_back_message : str=None, 
                 ex: Exception=None):

        super().__init__(message)
        self.message = message
        self.details = details
        self.layer = layer.value if layer is not None else None
        self.only_back_message = only_back_message
        self.ex = ex
        self.priority = priority if isinstance(priority, int) and 1 <= priority <= 5 else 3

class NotAuthenticatedError(Exception):
    def __init__(self,
                 message:str,
                 layer:ERRORS_LAYERS=None,
                 details: Union[str, dict] = None,
                 only_back_message: str = None,
                 ex: Exception = None):
        super().__init__(message)
        self.message = message
        self.layer = layer.value if layer is not None else None
        self.details = details
        self.only_back_message = only_back_message
        self.ex = ex

class InfrastructureError(Exception):
    """
        Base class for infrastructure-level errors
    """
    def __init__(self,
                 message: str,
                 layer: INFRA_ERROR_LAYERS,
                 priority: int = 3,
                 back_message: str = None,
                 only_back_message: str = None,
                 details: Union[str, dict] = None,
                 ex: Exception= None
                 ):
        super().__init__(message)
        self.message = message
        if layer is not None:
            self.layer = layer.value
        else:
            self.layer = None
        resolved_back_message = only_back_message if only_back_message is not None else back_message
        self.back_message = resolved_back_message
        self.only_back_message = resolved_back_message
        self.details = details
        self.ex = ex
        self.priority = priority if isinstance(priority, int) and 1 <= priority <= 5 else 3


warning_logger = logging.getLogger("warning_logger")

class ApplicationWarning:
    def __init__(self, warning: str, layer: ERRORS_LAYERS = None, details: Union[str, dict] = None, ex: Exception = None):
        self.warning = warning
        self.layer = layer.value if layer is not None else "application_warning"
        self.details = details
        self.ex = ex

        parts = [f"Layer: {self.layer}", warning]
        if details is not None:
            parts.append(f"Details: {details}")
        if ex is not None:
            parts.append(f"Exception: {type(ex).__name__}: {ex}")

        warning_logger.warning(" | ".join(parts))

class InfrastructureWarning:
    def __init__(self, warning:str, layer:INFRA_ERROR_LAYERS=None):
        self.warning = warning
        self.layer = layer.value if layer is not None else "infra_warning"
        warning_logger.warning(
            f"Layer: {self.layer} | {self.warning}"
        )