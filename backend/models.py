from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Numeric, Enum
from sqlalchemy.relationship import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(enum.Enum):
    USER = "user"
    ADMIN = "admin"

class AccessLevel(enum.Enum):
    FREE = 0
    PAID = 1

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    purchases = relationship("Purchase", back_populates="user")
    video_views = relationship("VideoView", back_populates="user")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    slug = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    videos = relationship("Video", back_populates="category")

class Video(Base):
    __tablename__ = "videos"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    thumbnail_url = Column(String)
    video_url = Column(String, nullable=False)  # Digital Ocean Spaces URL
    hls_url = Column(String)  # HLS streaming URL
    duration = Column(Integer)  # в секундах
    price = Column(Numeric(10, 2), default=0.00)
    access_level = Column(Enum(AccessLevel), default=AccessLevel.FREE)
    category_id = Column(Integer, ForeignKey("categories.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    category = relationship("Category", back_populates="videos")
    purchases = relationship("Purchase", back_populates="video")
    video_views = relationship("VideoView", back_populates="video")

class Purchase(Base):
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    video_id = Column(Integer, ForeignKey("videos.id"))
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String)  # kaspi_pay, card, etc.
    payment_id = Column(String)  # ID транзакции от платежной системы
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="purchases")
    video = relationship("Video", back_populates="purchases")

class VideoView(Base):
    __tablename__ = "video_views"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    video_id = Column(Integer, ForeignKey("videos.id"))
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())
    watch_duration = Column(Integer)  # сколько секунд просмотрел
    
    # Relationships
    user = relationship("User", back_populates="video_views")
    video = relationship("Video", back_populates="video_views")
