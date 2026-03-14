

from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

from domain.db_models.AutomaticEvents import AutomaticEvents
from application.exceptions import ApplicationError, InfrastructureError, ERRORS_LAYERS, INFRA_ERROR_LAYERS


class AutomaticEventsRepositoryDb:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        try:
            return self.db.query(AutomaticEvents).all()
        except OperationalError as ex:
            raise InfrastructureError("Database connection error while fetching automatic events", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            raise ApplicationError("Error fetching automatic events", layer=ERRORS_LAYERS.DATABASE, ex=ex)

    # this is never exposed to routes
    def delete_all(self):
        try:
            self.db.query(AutomaticEvents).delete()
            self.db.commit()
        except OperationalError as ex:
            self.db.rollback()
            raise InfrastructureError("Database connection error while deleting automatic events", layer=INFRA_ERROR_LAYERS.REPOSITORIES, ex=ex)
        except Exception as ex:
            self.db.rollback()
            raise ApplicationError("Error deleting automatic events", layer=ERRORS_LAYERS.DATABASE, ex=ex)