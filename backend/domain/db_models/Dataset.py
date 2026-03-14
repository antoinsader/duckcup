from dataclasses import dataclass
from sqlalchemy import  Column, Integer, String, ForeignKey
from typing import Any


from api.core.db import Base

class Dataset(Base):
    __tablename__ = "datasets"

    dataset_id = Column(Integer, primary_key=True, index=True)
    ds_name = Column(String, unique=True)
    count_emails = Column(Integer, default=0)

    dataset_type = Column(String) # EMAIL_GMAIL, MESSAGING_TELEGRAM, other types in the future


    file_name= Column(String, unique=True)
    adv_summaries_file = Column(String,nullable=True, unique=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))

@dataclass
class DatasetFront:
    dataset_id: int
    ds_name: str
    count_emails: int
    dataset_type: str
    file_name: str = None

    @staticmethod
    def _from_dataset(dataset:Dataset) -> 'DatasetFront':
        """Convert Dataset db model to DatasetFront domain model, which is used in the frontend and does not contain file paths and user_id"""
        return DatasetFront(
            dataset_id = dataset.dataset_id,
            ds_name=dataset.ds_name,
            count_emails= dataset.count_emails,
            dataset_type= dataset.dataset_type,
        )


@dataclass
class DatasetMessages:
    message_id: int
    entity_id: str
    entity_name: str | None
    message_date: str | None
    message_text: str
    message_clean_text: str
    sender_username: str | None
    emojis: str | None = None
    tags: str | None = None

    def __getitem__(self, key):
        return getattr(self, key)

    @staticmethod
    def _from_dict(item: dict[str, Any]) -> "DatasetMessages":
        return DatasetMessages(
            message_id=item.get("message_id"),
            entity_id=item.get("entity_id"),
            entity_name=item.get("entity_name"),
            message_date=item.get("message_date"),
            message_text=item.get("message_text"),
            message_clean_text=item.get("message_clean_text"),
            sender_username=item.get("sender_username"),
            emojis = item.get("emojis"),
            tags = item.get("tags"),
        )
