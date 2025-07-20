from uuid import UUID
from fastapi import Form
from typing import Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field
from src.modules.attributes.schemas import AttributeValueRead

class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None
    access_level: int = Field(ge=0, le=2, description="0=Free, 1=One-time purchase, 2=Subscription")
    price: Optional[Decimal] = None
    attribute_value_ids: Optional[list[UUID]] = None


class VideoCreate(VideoBase):
    @classmethod
    def as_form(
        cls,
        title: str = Form(...),
        description: Optional[str] = Form(None),
        price: Optional[Decimal] = Form(None),
        attribute_value_ids: Optional[list[UUID]] = Form(None)
    ) -> "VideoCreate":
        return cls(
            title=title,
            description=description,
            price=price,
            attribute_value_ids=[
                UUID(i.strip()) for i in attribute_value_ids.split(",")
            ] if attribute_value_ids else None,
        )


class VideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    access_level: Optional[int] = Field(None, ge=0, le=2)
    price: Optional[Decimal] = None
    attribute_value_ids: Optional[list[UUID]] = None

    @classmethod
    def as_form(
        cls,
        title: Optional[str] = Form(None),
        description: Optional[str] = Form(None),
        access_level: Optional[int] = Form(None),
        price: Optional[Decimal] = Form(None),
        attribute_value_ids: Optional[list[UUID]] = Form(None)
    ) -> "VideoUpdate":
        return cls(
            title=title,
            description=description,
            access_level=access_level,
            price=price,
            attribute_value_ids=[
                UUID(i.strip()) for i in attribute_value_ids.split(",")
            ] if attribute_value_ids else None,
        )


class VideoRead(VideoBase):
    id: UUID
    preview_url: Optional[str] = None
    hls_url: Optional[str] = None
    created_at: datetime
    attributes: Optional[list[AttributeValueRead]] = None