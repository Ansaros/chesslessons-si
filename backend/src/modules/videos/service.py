from uuid import UUID
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import VideoTable
from src.modules.videos.crud import VideoDatabase
from src.modules.videos.schemas import VideoCreate, VideoUpdate, VideoFilter


class VideoService:
    def __init__(self, database: VideoDatabase):
        self.database = database

    async def create_video(self, data: VideoCreate, db: AsyncSession) -> VideoTable:
        return await self.database.create(db, data)

    async def get_by_id(self, video_id: UUID, db: AsyncSession) -> VideoTable:
        return await self.database.get(db, video_id)

    async def get_many(self, skip: int, limit: int, db: AsyncSession) -> list[VideoTable]:
        return await self.database.get_multi(db, skip=skip, limit=limit)

    async def update_video(self, video_id: UUID, data: VideoUpdate, db: AsyncSession) -> VideoTable:
        db_obj = await self.database.get(db, video_id)
        return await self.database.update(db, db_obj=db_obj, obj_in=data)

    async def delete_video(self, video_id: UUID, db: AsyncSession) -> VideoTable:
        return await self.database.remove(db, id=video_id)

    async def get_videos_by_category(self, category_id: UUID, db: AsyncSession) -> list[VideoTable]:
        return await self.database.get_objects(db, return_many=True, category_id=category_id)

    async def get_videos_by_level(self, level: str, db: AsyncSession) -> list[VideoTable]:
        return await self.database.get_objects(db, return_many=True, level_required=level)

    async def get_free_videos(self, db: AsyncSession) -> list[VideoTable]:
        return await self.database.get_objects(db, return_many=True, access_level=0)

    async def get_paid_videos(self, db: AsyncSession) -> list[VideoTable]:
        return await self.database.get_objects(db, return_many=True, access_level=1)

    async def get_subscription_videos(self, db: AsyncSession) -> list[VideoTable]:
        return await self.database.get_objects(db, return_many=True, access_level=2)
