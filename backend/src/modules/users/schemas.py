from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


class wUserBase(BaseModel):
    email: EmailStr
    chess_level_id: UUID


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