from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db
from models import Purchase, Video, User, PaymentStatus
from schemas import PurchaseCreate, PurchaseResponse
from auth_utils import get_current_user
from services.payment_service import PaymentService

router = APIRouter()

@router.post("/purchase", response_model=dict)
async def create_purchase(
    purchase_data: PurchaseCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Проверяем видео
    video = db.query(Video).filter(Video.id == purchase_data.video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if video.price <= 0:
        raise HTTPException(status_code=400, detail="This video is free")
    
    # Проверяем, не купил ли уже пользователь это видео
    existing_purchase = db.query(Purchase).filter(
        Purchase.user_id == current_user.id,
        Purchase.video_id == purchase_data.video_id,
        Purchase.status == PaymentStatus.COMPLETED
    ).first()
    
    if existing_purchase:
        raise HTTPException(status_code=400, detail="Video already purchased")
    
    # Создаем покупку
    purchase = Purchase(
        user_id=current_user.id,
        video_id=purchase_data.video_id,
        amount=video.price,
        payment_method=purchase_data.payment_method,
        status=PaymentStatus.PENDING
    )
    
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    
    # Инициируем платеж
    payment_service = PaymentService()
    
    try:
        if purchase_data.payment_method == "kaspi_pay":
            payment_url = await payment_service.create_kaspi_payment(
                purchase.id, 
                video.price, 
                f"Покупка урока: {video.title}"
            )
            return {
                "purchase_id": purchase.id,
                "payment_url": payment_url,
                "status": "pending"
            }
        else:
            raise HTTPException(status_code=400, detail="Unsupported payment method")
            
    except Exception as e:
        # Если ошибка при создании платежа, помечаем покупку как неудачную
        purchase.status = PaymentStatus.FAILED
        db.commit()
        raise HTTPException(status_code=500, detail=f"Payment creation failed: {str(e)}")

@router.post("/webhook/kaspi")
async def kaspi_webhook(
    payment_data: dict,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Webhook для обработки уведомлений от Каспи"""
    payment_service = PaymentService()
    
    # Проверяем подпись webhook
    if not payment_service.verify_kaspi_webhook(payment_data):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    
    purchase_id = payment_data.get("order_id")
    payment_status = payment_data.get("status")
    
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    
    if payment_status == "success":
        purchase.status = PaymentStatus.COMPLETED
        purchase.payment_id = payment_data.get("payment_id")
        purchase.completed_at = func.now()
    elif payment_status == "failed":
        purchase.status = PaymentStatus.FAILED
    
    db.commit()
    
    return {"status": "ok"}

@router.get("/purchases", response_model=List[PurchaseResponse])
def get_user_purchases(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    purchases = db.query(Purchase).filter(
        Purchase.user_id == current_user.id
    ).order_by(Purchase.created_at.desc()).all()
    
    return purchases

@router.get("/purchases/{purchase_id}", response_model=PurchaseResponse)
def get_purchase(
    purchase_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    purchase = db.query(Purchase).filter(
        Purchase.id == purchase_id,
        Purchase.user_id == current_user.id
    ).first()
    
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    
    return purchase

@router.post("/purchases/{purchase_id}/verify")
def verify_purchase(
    purchase_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Проверка статуса покупки"""
    purchase = db.query(Purchase).filter(
        Purchase.id == purchase_id,
        Purchase.user_id == current_user.id
    ).first()
    
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    
    return {
        "purchase_id": purchase.id,
        "status": purchase.status.value,
        "video_id": purchase.video_id,
        "amount": purchase.amount
    }
