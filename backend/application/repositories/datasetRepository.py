

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, OperationalError
from domain.db_models.Dataset import Dataset
from application.exceptions import ApplicationError, InfrastructureError, ERRORS_LAYERS, INFRA_ERROR_LAYERS


class DatasetRepositoryDb:
    def __init__(self, db: Session):
        self.db = db

    def get_user_datasets(self, user_id: int) -> list[Dataset]:
        try:
            return self.db.query(Dataset).filter(Dataset.user_id == user_id).all()
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while fetching user datasets", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error fetching user datasets", layer=ERRORS_LAYERS.DATABASE, ex=ex)

    def get_dataset_by_id(self, dataset_id: int) -> Dataset:
        try:
            return self.db.query(Dataset).filter(Dataset.dataset_id == dataset_id).first()
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while fetching dataset", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error fetching dataset by id", layer=ERRORS_LAYERS.DATABASE, ex=ex)

    def check_ds_name(self, ds_name:str, ds_user_id:int)->Dataset:
        try:
            ds = self.db.query(Dataset).filter(Dataset.ds_name == ds_name).filter(Dataset.user_id == ds_user_id).first()
            return True if ds is not None else False
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while checking dataset name", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error checking dataset name", layer=ERRORS_LAYERS.DATABASE, ex=ex)


    def count_user_datasets(self, ds_user_id: int) -> int:
        try:
            return self.db.query(Dataset).filter(Dataset.user_id == ds_user_id).count()
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while counting user datasets", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error counting user datasets", layer=ERRORS_LAYERS.DATABASE, ex=ex)


    def create(self, 
               ds_name: str, 
               user_id: int, 
               file_name: str,  
               count_emails: int,
               dataset_type: str,
               adv_summary_file:str= None 
               ) -> Dataset:
        new_ds = Dataset(
            ds_name=ds_name,
            file_name=file_name,
            user_id=user_id,
            adv_summaries_file=adv_summary_file,
            count_emails=count_emails,
            dataset_type=dataset_type
        )
        try:
            self.db.add(new_ds)
            self.db.commit()
            self.db.refresh(new_ds)
            return new_ds
        except IntegrityError as ex:
            self.db.rollback()
            raise ApplicationError("Dataset with this name already exists for this user", layer=ERRORS_LAYERS.DATABASE, ex=ex)
        except OperationalError as ex:
            self.db.rollback()
            raise InfrastructureError("Database connection error while creating dataset", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            self.db.rollback()
            raise ApplicationError("Error creating dataset", layer=ERRORS_LAYERS.DATABASE, ex=ex)

    def update(self, dataset_id: int, **kwargs) -> Dataset:
        try:
            db_ds = self.db.query(Dataset).filter(Dataset.dataset_id == dataset_id).first()
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while fetching dataset for update", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error fetching dataset for update", layer=ERRORS_LAYERS.DATABASE, ex=ex)
        if not db_ds:
            return None
        for key, value in kwargs.items():
            if hasattr(db_ds, key):
                setattr(db_ds, key, value)
        try:
            self.db.commit()
            self.db.refresh(db_ds)
            return db_ds
        except OperationalError as ex:
            self.db.rollback()
            raise InfrastructureError("Database connection error while updating dataset", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            self.db.rollback()
            raise ApplicationError("Error updating dataset", layer=ERRORS_LAYERS.DATABASE, ex=ex)

    def delete_dataset(self, dataset_id: int) -> bool:
        ds = self.get_dataset_by_id(dataset_id)
        if not ds:
            raise ApplicationError("Dataset not found for deletion", layer=ERRORS_LAYERS.DATABASE, details={"dataset_id": dataset_id})
        try:
            self.db.delete(ds)
            self.db.commit()
            return True
        except OperationalError as ex:
            self.db.rollback()
            raise InfrastructureError("Database connection error while deleting dataset", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            self.db.rollback()
            raise ApplicationError("Error deleting dataset", layer=ERRORS_LAYERS.DATABASE, ex=ex)
