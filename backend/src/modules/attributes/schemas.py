from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class AttributeTypeBase(BaseModel):
    name: str


class AttributeTypeCreate(AttributeTypeBase):
    pass


class AttributeTypeRead(AttributeTypeBase):
    id: UUID
    created_at: datetime


class AttributeValueBase(BaseModel):
    value: str
    type_id: UUID


class AttributeValueCreate(AttributeValueBase):
    pass


class AttributeValueRead(AttributeValueBase):
    id: UUID
    created_at: datetime
    name: str
