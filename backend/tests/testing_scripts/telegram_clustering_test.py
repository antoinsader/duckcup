


from application.factories.ClusteringFactory import build_clustering_strategy
from application.repositories.datasetRepository import DatasetRepositoryDb

from api.core.config import settings
from api.core.db import create_db_engine, create_session_factory
from domain.db_models.Dataset import Dataset, DatasetMessages
from domain.enums import DatasetMessagesAnalysisProperties
from infrastructure.encryption.fernet import FernetEncrypter
from infrastructure.storage.dataset_files_repository import FileDatasetRepository

from application.use_cases.clustering import _cluster_documents

from infrastructure.utils.messages_utils import get_top_senders

def main():
    engine = create_db_engine(settings.database_url)
    SessionLocal = create_session_factory(engine)
    db = SessionLocal()


    dataset_id = 1
    user_id  = 1
    dataset_repo = DatasetRepositoryDb(db)
    dataset = dataset_repo.get_dataset_by_id(dataset_id)
    encrypter = FernetEncrypter( settings.backend_secrets_encryption_key.get_secret_value())
    files_repo = FileDatasetRepository(user_id, dataset.ds_name, encrypter)
    content = files_repo.load_dataset()
    

    sender_attribute = DatasetMessagesAnalysisProperties.SENDER_SIGNATURE.value
    text_attribute = DatasetMessagesAnalysisProperties.TEXT.value
    subject_attribute = DatasetMessagesAnalysisProperties.SUBJECT.value
    content = [DatasetMessages._from_dict(item) for item in content]

    clustering_algorithm = "tokens_kmeans"
    k_clusters = 4
    strategy = build_clustering_strategy(clustering_algorithm, k_clusters)
    
    top_senders = get_top_senders(content, sender_attribute=sender_attribute)
    print(f"Top senders: {top_senders}")

