from enum import Enum
from uuid import uuid4
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    String,
    DateTime,
    Integer,
    ForeignKey,
    Numeric,
    Text,
    UniqueConstraint,
    Boolean,
)
from sqlalchemy.orm import relationship
from sqlalchemy import Enum as SQLAEnum
from sqlalchemy.dialects.postgresql import UUID

from src.core.database import Base



class AccessLevelEnum(int, Enum):
    FREE = 0
    ONE_TIME = 1
    SUBSCRIPTION = 2


class UserTable(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    chess_level = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    purchases = relationship("PurchaseTable", back_populates="user")
    views = relationship("ViewLogTable", back_populates="user")


class AttributeTypeTable(Base):
    __tablename__ = "attribute_types"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    values = relationship("AttributeValueTable", back_populates="type", cascade="all, delete")


class AttributeValueTable(Base):
    __tablename__ = "attribute_values"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    type_id = Column(UUID(as_uuid=True), ForeignKey("attribute_types.id", ondelete="CASCADE"))
    value = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    type = relationship("AttributeTypeTable", back_populates="values")
    video_links = relationship("VideoAttributeLinkTable", back_populates="attribute_value", cascade="all, delete")


class VideoTable(Base):
    __tablename__ = "videos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    title = Column(String, nullable=False)
    description = Column(Text)
    preview_url = Column(String)
    hls_url = Column(String)

    access_level = Column(Integer, default=0, nullable=False)
    price = Column(Numeric, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    attributes = relationship("VideoAttributeLinkTable", back_populates="video", cascade="all, delete")
    purchases = relationship("PurchaseTable", back_populates="video", cascade="all, delete")
    views = relationship("ViewLogTable", back_populates="video", cascade="all, delete")


class VideoAttributeLinkTable(Base):
    __tablename__ = "video_attributes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    video_id = Column(UUID(as_uuid=True), ForeignKey("videos.id", ondelete="CASCADE"))
    attribute_value_id = Column(UUID(as_uuid=True), ForeignKey("attribute_values.id", ondelete="CASCADE"))

    video = relationship("VideoTable", back_populates="attributes")
    attribute_value = relationship("AttributeValueTable", back_populates="video_links")


class PurchaseTable(Base):
    __tablename__ = "purchases"
    __table_args__ = (UniqueConstraint("user_id", "video_id", name="unique_purchase"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    video_id = Column(UUID(as_uuid=True), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    purchase_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("UserTable", back_populates="purchases")
    video = relationship("VideoTable", back_populates="purchases")


class ViewLogTable(Base):
    __tablename__ = "views"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    video_id = Column(UUID(as_uuid=True), ForeignKey("videos.id", ondelete="SET NULL"))
    viewed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("UserTable", back_populates="views")
    video = relationship("VideoTable", back_populates="views")