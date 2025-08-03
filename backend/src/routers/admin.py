from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, UploadFile, File, Form

from src.models import UserTable
from src.core.database import get_db
from src.modules.videos.service import VideoService
from src.schemas import ListResponse, StatusResponse
from src.modules.auth.dependencies import get_admin_user
from src.modules.attributes.service import AttributeService
from src.modules.videos.dependencies import get_video_service
from src.modules.attributes.dependencies import get_attribute_service
from src.modules.videos.schemas import VideoCreate, VideoUpdate, VideoRead
from src.modules.attributes.schemas import AttributeTypeCreate, AttributeValueCreate, AttributeValueRead, AttributeTypeSimple


router = APIRouter()

@router.post("/videos/", response_model=VideoRead, summary="Upload a new video")
async def create_video(
    db: AsyncSession = Depends(get_db),
    video_file: UploadFile = File(...),
    preview_file: UploadFile = File(...),
    data: VideoCreate = Depends(VideoCreate.as_form),
    сurrent_user: UserTable = Depends(get_admin_user),
    attribute_value_ids: Optional[str] = Form(None),
    video_service: VideoService = Depends(get_video_service),
):
    attribute_value_ids = (
        [UUID(x.strip()) for x in attribute_value_ids.split(",")]
        if attribute_value_ids else []
    )
    return await video_service.create_video(data, video_file, preview_file, attribute_value_ids, db)


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
    attribute_value_ids: Optional[str] = Form(None),
    video_service: VideoService = Depends(get_video_service),
):
    attribute_value_ids = (
        [UUID(x.strip()) for x in attribute_value_ids.split(",")]
        if attribute_value_ids else []
    )
    return await video_service.update_video(video_id, data, preview_file, attribute_value_ids, db)


@router.delete("/videos/{video_id}", response_model=VideoRead, summary="Delete video by ID")
async def delete_video(
    video_id: UUID,
    db: AsyncSession = Depends(get_db),
    сurrent_user: UserTable = Depends(get_admin_user),
    video_service: VideoService = Depends(get_video_service),
):
    await video_service.delete_video(video_id, db)
    return StatusResponse(message="Video deleted successfully")


@router.post("/attribute/types", response_model=AttributeTypeSimple, summary="Create a new attribute type")
async def create_attribute_type(
    data: AttributeTypeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserTable = Depends(get_admin_user),
    attribute_service: AttributeService = Depends(get_attribute_service),
):
    return await attribute_service.create_type(data, db)


@router.post("/attribute/values", response_model=AttributeValueRead, summary="Create a new attribute value")
async def create_attribute_value(
    data: AttributeValueCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserTable = Depends(get_admin_user),
    attribute_service: AttributeService = Depends(get_attribute_service),
):
    return await attribute_service.create_value(data, db)


@router.delete("/attribute/types/{id}", response_model=StatusResponse, summary="Delete attribute type by ID")
async def delete_type(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserTable = Depends(get_admin_user),
    attribute_service: AttributeService = Depends(get_attribute_service),
):
    await attribute_service.delete_type(id, db)
    return StatusResponse(message="Attribute type deleted successfully")


@router.delete("/attribute/values/{id}", response_model=StatusResponse, summary="Delete attribute value by ID")
async def delete_value(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserTable = Depends(get_admin_user),
    attribute_service: AttributeService = Depends(get_attribute_service),
):
    await attribute_service.delete_value(id, db)
    return StatusResponse(message="Attribute value deleted successfully")
