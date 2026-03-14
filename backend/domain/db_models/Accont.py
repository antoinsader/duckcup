from dataclasses import dataclass
from sqlalchemy import  Column, Integer, String, ForeignKey,UniqueConstraint


from api.core.db import Base

class Account(Base):
    __tablename__ = "accounts"

    account_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    provider_type = Column(String, nullable=False, default="EMAIL")
    email_provider_id = Column(String)
    email = Column(String)
    refresh_token = Column(String, nullable=True)

    __table_args__ = (
        UniqueConstraint('user_id', 'email', name='_user_email_uc'),
    )

@dataclass
class AccountFront:
    """Subclass from Account to send to front-end"""
    account_id: int
    user_id: int
    email: str
    email_provider_id: str
    provider_type: str = "EMAIL"
    need_to_login: bool = False
    inbox_count: int = 0

    @classmethod
    def _from_account(self, account:Account, need_to_login: bool = False) -> 'AccountFront':
        return self(
            account_id = account.account_id,
            provider_type=getattr(account, "provider_type", "EMAIL") or "EMAIL",
            email=account.email,
            email_provider_id = account.email_provider_id,
            user_id= account.user_id,
            need_to_login=need_to_login
        )
    