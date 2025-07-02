from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from models import UserRole, AccessLevel, PaymentStatus

# Добавить недостающие импорты
from models import User as UserModel

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Category schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    slug: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Video schemas
class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: Decimal = Decimal('0.00')
    access_level: AccessLevel = AccessLevel.FREE
    category_id: int

class VideoCreate(VideoBase):
    pass

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    access_level: Optional[AccessLevel] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None

class VideoResponse(VideoBase):
    id: int
    thumbnail_url: Optional[str]
    video_url: str
    hls_url: Optional[str]
    duration: Optional[int]
    is_active: bool
    created_at: datetime
    category: CategoryResponse
    
    class Config:
        from_attributes = True

# Purchase schemas
class PurchaseCreate(BaseModel):
    video_id: int
    payment_method: str

class PurchaseResponse(BaseModel):
    id: int
    video_id: int
    amount: Decimal
    payment_method: str
    status: PaymentStatus
    created_at: datetime
    video: VideoResponse
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Statistics schemas
class VideoStats(BaseModel):
    video_id: int
    title: str
    total_purchases: int
    total_revenue: Decimal
    total_views: int
    
class AdminStats(BaseModel):
    total_users: int
    total_videos: int
    total_revenue: Decimal
    recent_purchases: List[PurchaseResponse]

# Video View schemas
class VideoViewCreate(BaseModel):
    video_id: int
    watch_duration: Optional[int] = None

class VideoViewResponse(BaseModel):
    id: int
    video_id: int
    user_id: int
    viewed_at: datetime
    watch_duration: Optional[int]
    
    class Config:
        from_attributes = True

# Error schemas
class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None

# Success schemas
class SuccessResponse(BaseModel):
    message: str
    data: Optional[dict] = None
