from uuid import UUID
from pydantic import BaseModel


class AttributeTypeBase(BaseModel):
    name: str


class AttributeTypeCreate(AttributeTypeBase):
    pass


class AttributeValueBase(BaseModel):
    value: str


class AttributeValueCreate(AttributeValueBase):
    type_id: UUID


class AttributeValueRead(AttributeValueBase):
    id: UUID


class AttributeTypeRead(AttributeTypeBase):
    id: UUID
    values: list[AttributeValueRead]