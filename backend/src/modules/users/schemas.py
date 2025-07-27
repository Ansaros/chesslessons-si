from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    chess_level: str


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    chess_level: str

class PasswordUpdate(BaseModel):
    password: str