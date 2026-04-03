"""用户模型"""
from datetime import datetime
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(default=None, primary_key=True, max_length=12)
    phone: str = Field(max_length=20, unique=True, index=True)
    nickname: str = Field(max_length=100)
    avatar: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)