from sqlalchemy import  Column, Integer, String, ForeignKey, UniqueConstraint


from api.core.db import Base

class UserKeys(Base):
    __tablename__ = "user_keys"

    key_id = Column(Integer, primary_key=True, index=True)
    key_name = Column(String)
    key_value_encrypted = Column(String, unique=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))

    __table_args__ = (
        UniqueConstraint('user_id', 'key_name', name='_user_key_uc'),
    )