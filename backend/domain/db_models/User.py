
from dataclasses import dataclass
from sqlalchemy import  Column, Integer, String, ForeignKey


from api.core.db import Base



class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String(244), unique=True)

@dataclass
class User_Front:
    """User without password"""
    user_id: int
    username: str


    @classmethod
    def _from_user(self, u:User):
        return self(user_id = u.user_id, username= u.username)