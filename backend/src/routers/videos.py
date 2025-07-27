from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import UserTable
from src.schemas import ListResponse
from src.core.database import get_db
from src.modules.videos.service import VideoService
from src.modules.auth.dependencies import get_current_user
from src.modules.videos.dependencies import get_video_service
from src.modules.videos.schemas import VideoRead, VideoShortRead

router = APIRouter()


@router.get("", response_model=ListResponse[VideoShortRead], summary="Get video previews")
async def get_video_previews(
    access_level: Optional[int] = Query(None, ge=0, le=2),
    attribute_value_ids: Optional[list[UUID]] = Query(None),
    db: AsyncSession = Depends(get_db),
    video_service: VideoService = Depends(get_video_service),
):
    videos, total = await video_service.filter_videos_by_attributes(access_level, attribute_value_ids, db)
    return ListResponse[VideoShortRead](data=videos, total=len(total))


@router.get("/{video_id}", response_model=VideoRead, summary="Get video by ID")
async def view_video_by_id(
    video_id: UUID,
    db: AsyncSession = Depends(get_db),
    video_service: VideoService = Depends(get_video_service),
    current_user: Optional[UserTable] = Depends(get_current_user),
):
    return await video_service.view_video(video_id, current_user, db)