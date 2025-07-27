from uuid import UUID
from fastapi import Form
from typing import Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field

class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None
    access_level: int = Field(ge=0, le=2, description="0=Free, 1=One-time purchase, 2=Subscription")
    price: Optional[Decimal] = None
    preview_url: Optional[str] = None
    hls_url: Optional[str] = None


class VideoCreate(VideoBase):
    @classmethod
    def as_form(
        cls,
        title: str = Form(...),
        description: Optional[str] = Form(None),
        access_level: Optional[int] = Form(None),
        price: Optional[Decimal] = Form(None),
    ) -> "VideoCreate":
        return cls(
            title=title,
            description=description,
            access_level=access_level,
            price=price,
        )


class VideoUpdate(VideoBase):
    title: Optional[str] = None
    access_level: Optional[int] = Field(None, ge=0, le=2)
    
    @classmethod
    def as_form(
        cls,
        title: Optional[str] = Form(None),
        description: Optional[str] = Form(None),
        access_level: Optional[int] = Form(None),
        price: Optional[Decimal] = Form(None),
    ) -> "VideoUpdate":
        return cls(
            title=title,
            description=description,
            access_level=access_level,
            price=price,
        )

class AttributeTypedValueRead(BaseModel):
    type: str
    value: str

class VideoRead(VideoBase):
    id: UUID
    preview_url: Optional[str] = None
    hls_url: Optional[str] = None
    created_at: Optional[datetime] = None
    attributes: Optional[list[AttributeTypedValueRead]] = None
    hls_segments: dict[str, str] = {}

class VideoShortRead(BaseModel):
    id: UUID
    title: str
    preview_url: str
    access_level: int
    price: Decimal | None