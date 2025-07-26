from uuid import UUID
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.crudbase import CRUDBase
from src.models import VideoTable, VideoAttributeLinkTable
from src.modules.videos.schemas import VideoCreate, VideoUpdate


class VideoDatabase(CRUDBase[VideoTable, VideoUpdate, VideoCreate]):
    async def add_attributes(
        self,
        db: AsyncSession,
        video_id: UUID,
        attribute_ids: list[UUID]
    ):
        await db.execute(
            delete(VideoAttributeLinkTable).where(VideoAttributeLinkTable.video_id == video_id)
        )
        db.add_all([
            VideoAttributeLinkTable(video_id=video_id, attribute_value_id=attr_id)
            for attr_id in attribute_ids
        ])
        await db.flush()
