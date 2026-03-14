from sqlalchemy import  Column, Integer, String,  DateTime
from api.core.db import Base

class AutomaticEvents(Base):
    __tablename__ = "automatic_events"

    event_id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String, unique=True, nullable=False)
    last_update = Column(DateTime(timezone=True), nullable=True)
    repeat_every_n_days = Column(Integer, nullable=False)

