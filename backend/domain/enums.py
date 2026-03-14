from enum import Enum

from infrastructure.storage.meta_files_repository import META_FILES, MetaFilesRepository

class PROMPTER_NAMES(str, Enum):
    HUGGING_FACE = 'hugging_face'
    POLLINATION = 'pollination'



class Embedders(str, Enum):
    OLLAMA = 'ollama'
    SENTENCE_TRANSFORMERS = "sentence_transformers"




class clustering_algorithms(str, Enum):
    TOKENS_KMEANS = 'tokens_kmeans'
    SEMANTICS_KMEANS = 'sematics_kmeans'
    LDA = 'lda'
    ADVANCED = 'advanced'

class EmailsAnalysisProperties(str, Enum):
    SENDER_SIGNATURE = 'sender_signature'
    ID = 'email_id'
    TEXT = 'content_clean'
    SUBJECT = "subject"
    DATE="date"

class DatasetMessagesAnalysisProperties(str, Enum):
    SENDER_SIGNATURE = 'entity_name'
    ID = 'message_id'
    TEXT = 'message_clean_text'
    DATE = "message_date"
    SUBJECT= "emojis"

po_repo = MetaFilesRepository(META_FILES.POLLINATION_MODELS)
hf_repo = MetaFilesRepository(META_FILES.HUGGING_FACE_MODELS_META)


PROMPTER_MODELS = {
    "pollination": po_repo.load_meta_file(),
    "hugging_face": hf_repo.load_meta_file(),
}

