from uuid import UUID
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class AttributeTypeBase(BaseModel):
    name: str


class AttributeTypeCreate(AttributeTypeBase):
    pass


class AttributeValueBase(BaseModel):
    value: str
    type_id: UUID


class AttributeValueCreate(AttributeValueBase):
    pass


class AttributeValueRead(AttributeValueBase):
    id: UUID


class AttributeTypeRead(AttributeTypeBase):
    id: UUID
    values: list[AttributeValueRead]