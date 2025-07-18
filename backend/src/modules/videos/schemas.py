from uuid import UUID
from fastapi import Form
from typing import Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field

class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None
    preview_url: Optional[str] = None
    hls_url: Optional[str] = None
    access_level: int = Field(ge=0, le=2, description="0=Free, 1=One-time purchase, 2=Subscription")
    level_required: Optional[str] = None
    price: Optional[Decimal] = None
    category_id: Optional[UUID] = None


class VideoCreate(VideoBase):
    @classmethod
    def as_form(
        cls,
        title: str = Form(...),
        description: Optional[str] = Form(None),
        access_level: int = Form(...),
        level_required: Optional[str] = Form(None),
        price: Optional[Decimal] = Form(None),
        category_id: Optional[UUID] = Form(None),
    ) -> "VideoCreate":
        return cls(
            title=title,
            description=description,
            access_level=access_level,
            level_required=level_required,
            price=price,
            category_id=category_id,
        )


class VideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    access_level: Optional[int] = Field(None, ge=0, le=2)
    level_required: Optional[str] = None
    price: Optional[Decimal] = None
    category_id: Optional[UUID] = None
    preview_url: Optional[str] = None

    @classmethod
    def as_form(
        cls,
        title: Optional[str] = Form(None),
        description: Optional[str] = Form(None),
        access_level: Optional[int] = Form(None),
        level_required: Optional[str] = Form(None),
        price: Optional[Decimal] = Form(None),
        category_id: Optional[UUID] = Form(None),
    ) -> "VideoUpdate":
        return cls(
            title=title,
            description=description,
            access_level=access_level,
            level_required=level_required,
            price=price,
            category_id=category_id,
        )


class VideoRead(VideoBase):
    id: UUID
    created_at: datetime

    model_config = {
        "from_attributes": True
    }