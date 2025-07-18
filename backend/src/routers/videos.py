from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, UploadFile, File, Form

from src.core.database import get_db
from src.schemas import ListResponse
from src.modules.videos.service import VideoService
from src.modules.videos.dependencies import get_video_service
from src.modules.videos.schemas import VideoCreate, VideoUpdate, VideoRead

router = APIRouter(prefix="/videos", tags=["Videos"])

@router.post("/", response_model=VideoRead, summary="Upload a new video")
async def create_video(
    title: str = Form(...),
    description: str = Form(None),
    access_level: int = Form(...),
    level_required: str = Form(None),
    price: float = Form(None),
    category_id: str = Form(None),
    video_file: UploadFile = File(...),
    preview_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    video_service: VideoService = Depends(get_video_service),
):
    return await video_service.create_video(
        db=db,
        title=title,
        description=description,
        access_level=access_level,
        level_required=level_required,
        price=price,
        category_id=category_id,
        video_file=video_file,
        preview_file=preview_file,
    )


@router.get("/", response_model=ListResponse[VideoRead], summary="Get all videos")
async def get_all_videos(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    video_service: VideoService = Depends(get_video_service),
):
    videos = await video_service.get_many(db, skip=skip, limit=limit)
    return ListResponse[VideoRead](data=videos, total=len(videos))


@router.get("/{video_id}", response_model=VideoRead, summary="Get video by ID")
async def get_video_by_id(
    video_id: UUID,
    db: AsyncSession = Depends(get_db),
    video_service: VideoService = Depends(get_video_service),
):
    return await video_service.get_video_by_id(db, video_id)


@router.put("/{video_id}", response_model=VideoRead, summary="Update video by ID")
async def update_video(
    video_id: UUID,
    data: VideoUpdate,
    db: AsyncSession = Depends(get_db),
    video_service: VideoService = Depends(get_video_service),
):
    return await video_service.update_video(db, video_id, data)


@router.delete("/{video_id}", response_model=VideoRead, summary="Delete video by ID")
async def delete_video(
    video_id: UUID,
    db: AsyncSession = Depends(get_db),
    video_service: VideoService = Depends(get_video_service),
):
    return await video_service.delete_video(db, video_id)