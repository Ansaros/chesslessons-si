from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional

from database import get_db
from models import Video, Category, Purchase, VideoView, AccessLevel
from schemas import VideoResponse
from auth_utils import get_current_user

router = APIRouter()

@router.get("/", response_model=List[VideoResponse])
def get_videos(
    category_id: Optional[int] = Query(None),
    access_level: Optional[AccessLevel] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Video).filter(Video.is_active == True)
    
    if category_id:
        query = query.filter(Video.category_id == category_id)
    
    if access_level is not None:
        query = query.filter(Video.access_level == access_level)
    
    videos = query.offset(skip).limit(limit).all()
    return videos

@router.get("/{video_id}", response_model=VideoResponse)
def get_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(
        and_(Video.id == video_id, Video.is_active == True)
    ).first()
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    return video

@router.get("/{video_id}/stream")
def get_video_stream(
    video_id: int, 
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Проверяем права доступа
    if video.access_level == AccessLevel.PAID:
        purchase = db.query(Purchase).filter(
            and_(
                Purchase.user_id == current_user.id,
                Purchase.video_id == video_id,
                Purchase.status == "completed"
            )
        ).first()
        
        if not purchase:
            raise HTTPException(
                status_code=403, 
                detail="Access denied. Purchase required."
            )
    
    # Записываем просмотр
    view = VideoView(
        user_id=current_user.id,
        video_id=video_id
    )
    db.add(view)
    db.commit()
    
    return {
        "hls_url": video.hls_url,
        "video_url": video.video_url,
        "title": video.title
    }

@router.get("/category/{category_id}", response_model=List[VideoResponse])
def get_videos_by_category(
    category_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    videos = db.query(Video).filter(
        and_(Video.category_id == category_id, Video.is_active == True)
    ).offset(skip).limit(limit).all()
    
    return videos
