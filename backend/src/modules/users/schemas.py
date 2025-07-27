from uuid import UUID
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    chess_level_id: Optional[UUID] = None


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    chess_level_id: UUID


class PasswordUpdate(BaseModel):
    password: str


class UserCreateInternal(UserBase):
    hashed_password: str