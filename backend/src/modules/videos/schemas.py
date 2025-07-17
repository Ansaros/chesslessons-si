# schemas/video.py
from uuid import UUID
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


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
    pass


class VideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    preview_url: Optional[str] = None
    hls_url: Optional[str] = None
    access_level: Optional[int] = Field(ge=0, le=2)
    level_required: Optional[str] = None
    price: Optional[Decimal] = None
    category_id: Optional[UUID] = None


class VideoRead(VideoBase):
    id: UUID
    created_at: datetime

    class Config:
        orm_mode = True