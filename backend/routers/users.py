from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, Purchase, VideoView
from schemas import UserResponse, PurchaseResponse
from auth_utils import get_current_user

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile")
def update_profile(
    full_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.full_name = full_name
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Profile updated successfully"}

@router.get("/purchases", response_model=List[PurchaseResponse])
def get_my_purchases(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    purchases = db.query(Purchase).filter(
        Purchase.user_id == current_user.id,
        Purchase.status == "completed"
    ).order_by(Purchase.completed_at.desc()).all()
    
    return purchases

@router.get("/watch-history")
def get_watch_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    views = db.query(VideoView).filter(
        VideoView.user_id == current_user.id
    ).order_by(VideoView.viewed_at.desc()).limit(50).all()
    
    return [
        {
            "video_id": view.video_id,
            "video_title": view.video.title,
            "viewed_at": view.viewed_at,
            "watch_duration": view.watch_duration
        } for view in views
    ]
