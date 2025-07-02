from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from decimal import Decimal

from database import get_db
from models import Video, User, Purchase, VideoView, Category, AccessLevel
from schemas import VideoCreate, VideoUpdate, VideoResponse, AdminStats, VideoStats, UserResponse
from auth_utils import get_current_admin_user
from services.video_service import VideoService
from services.storage_service import StorageService

router = APIRouter()

@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_videos = db.query(Video).count()
    total_revenue = db.query(func.sum(Purchase.amount)).filter(
        Purchase.status == "completed"
    ).scalar() or Decimal('0.00')
    
    recent_purchases = db.query(Purchase).filter(
        Purchase.status == "completed"
    ).order_by(desc(Purchase.completed_at)).limit(10).all()
    
    return AdminStats(
        total_users=total_users,
        total_videos=total_videos,
        total_revenue=total_revenue,
        recent_purchases=recent_purchases
    )

@router.get("/videos/stats", response_model=List[VideoStats])
def get_video_stats(
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    # Статистика по видео с подсчетом покупок, выручки и просмотров
    stats = db.query(
        Video.id,
        Video.title,
        func.count(Purchase.id).label('total_purchases'),
        func.coalesce(func.sum(Purchase.amount), 0).label('total_revenue'),
        func.count(VideoView.id).label('total_views')
    ).outerjoin(Purchase, Video.id == Purchase.video_id)\
     .outerjoin(VideoView, Video.id == VideoView.video_id)\
     .group_by(Video.id, Video.title)\
     .all()
    
    return [
        VideoStats(
            video_id=stat.id,
            title=stat.title,
            total_purchases=stat.total_purchases,
            total_revenue=stat.total_revenue,
            total_views=stat.total_views
        ) for stat in stats
    ]

@router.post("/videos/upload")
async def upload_video(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category_id: int = Form(...),
    price: Decimal = Form(0.00),
    access_level: AccessLevel = Form(AccessLevel.FREE),
    video_file: UploadFile = File(...),
    thumbnail_file: Optional[UploadFile] = File(None),
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    # Проверяем категорию
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Проверяем тип файла
    if not video_file.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    try:
        storage_service = StorageService()
        video_service = VideoService()
        
        # Загружаем видео в Digital Ocean Spaces
        video_url = await storage_service.upload_video(video_file)
        
        # Загружаем превью если есть
        thumbnail_url = None
        if thumbnail_file:
            thumbnail_url = await storage_service.upload_thumbnail(thumbnail_file)
        
        # Создаем HLS версию видео (в фоне)
        hls_url = await video_service.create_hls_version(video_url)
        
        # Получаем длительность видео
        duration = await video_service.get_video_duration(video_url)
        
        # Создаем запись в БД
        db_video = Video(
            title=title,
            description=description,
            category_id=category_id,
            price=price,
            access_level=access_level,
            video_url=video_url,
            hls_url=hls_url,
            thumbnail_url=thumbnail_url,
            duration=duration
        )
        
        db.add(db_video)
        db.commit()
        db.refresh(db_video)
        
        return {
            "message": "Video uploaded successfully",
            "video_id": db_video.id,
            "video_url": video_url,
            "hls_url": hls_url
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.put("/videos/{video_id}", response_model=VideoResponse)
def update_video(
    video_id: int,
    video_update: VideoUpdate,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    db_video = db.query(Video).filter(Video.id == video_id).first()
    if not db_video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Обновляем только переданные поля
    update_data = video_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_video, field, value)
    
    db.commit()
    db.refresh(db_video)
    return db_video

@router.delete("/videos/{video_id}")
def delete_video(
    video_id: int,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    db_video = db.query(Video).filter(Video.id == video_id).first()
    if not db_video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Мягкое удаление - просто деактивируем
    db_video.is_active = False
    db.commit()
    
    return {"message": "Video deleted successfully"}

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    if role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role
    db.commit()
    
    return {"message": f"User role updated to {role}"}
