from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, UploadFile, File

from src.models import UserTable
from src.core.database import get_db
from src.modules.videos.service import VideoService
from src.schemas import ListResponse, StatusResponse
from src.modules.auth.dependencies import get_admin_user
from src.modules.videos.dependencies import get_video_service
from src.modules.videos.schemas import VideoCreate, VideoUpdate, VideoRead

router = APIRouter()

@router.post("/videos/", response_model=VideoRead, summary="Upload a new video")
async def create_video(
    db: AsyncSession = Depends(get_db),
    video_file: UploadFile = File(...),
    preview_file: UploadFile = File(...),
    data: VideoCreate = Depends(VideoCreate.as_form),
    сurrent_user: UserTable = Depends(get_admin_user),
    video_service: VideoService = Depends(get_video_service),
):
    return await video_service.create_video(data, video_file, preview_file, db)


@router.get("/videos/", response_model=ListResponse[VideoRead], summary="Get all videos")
async def get_all_videos(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    сurrent_user: UserTable = Depends(get_admin_user),
    video_service: VideoService = Depends(get_video_service),
):
    videos = await video_service.get_many(skip, limit, db)
    return ListResponse[VideoRead](data=videos, total=len(videos))


@router.put("/videos/{video_id}", response_model=VideoRead, summary="Update video by ID")
async def update_video(
    video_id: UUID,
    db: AsyncSession = Depends(get_db),
    preview_file: Optional[UploadFile] = File(None),
    data: VideoUpdate = Depends(VideoUpdate.as_form),
    сurrent_user: UserTable = Depends(get_admin_user),
    video_service: VideoService = Depends(get_video_service),
):
    return await video_service.update_video(video_id, data, preview_file, db)


@router.delete("/videos/{video_id}", response_model=VideoRead, summary="Delete video by ID")
async def delete_video(
    video_id: UUID,
    db: AsyncSession = Depends(get_db),
    сurrent_user: UserTable = Depends(get_admin_user),
    video_service: VideoService = Depends(get_video_service),
):
    await video_service.delete_video(db, video_id)
    return StatusResponse(message="Video deleted successfully")