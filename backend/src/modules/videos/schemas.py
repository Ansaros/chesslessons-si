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


class VideoRead(VideoBase):
    id: UUID
    preview_url: Optional[str] = None
    hls_url: Optional[str] = None
    created_at: datetime
    attributes: Optional[list[AttributeValueRead]] = None