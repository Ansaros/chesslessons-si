from uuid import UUID
from typing import Optional

from sqlalchemy.orm import selectinload
from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.crudbase import CRUDBase
from src.modules.videos.schemas import VideoCreate, VideoUpdate
from src.models import VideoTable, VideoAttributeLinkTable, AttributeValueTable, ViewLogTable


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


    async def filter_by_access_and_attributes(
        self,
        db: AsyncSession,
        access_level: Optional[int] = None,
        attribute_value_ids: Optional[list[UUID]] = None,
    ) -> list[VideoTable]:
        stmt = select(VideoTable).distinct()

        if attribute_value_ids:
            stmt = stmt.join(VideoAttributeLinkTable).filter(
                VideoAttributeLinkTable.attribute_value_id.in_(attribute_value_ids)
            )

        if access_level is not None:
            stmt = stmt.filter(VideoTable.access_level == access_level)

        stmt = stmt.options(
            selectinload(VideoTable.attributes)
            .selectinload(VideoAttributeLinkTable.attribute_value)
            .selectinload(AttributeValueTable.type)
        )

        result = await db.execute(stmt)
        return result.scalars().all()
    
    async def log_view(self, db: AsyncSession, user_id: UUID, video_id: UUID):
        db.add(ViewLogTable(user_id=user_id, video_id=video_id))
        await db.flush()


    async def get_views_count_map(self, db: AsyncSession, video_ids: list[UUID]) -> dict[UUID, int]:
        stmt = (
            select(ViewLogTable.video_id, func.count().label("count"))
            .where(ViewLogTable.video_id.in_(video_ids))
            .group_by(ViewLogTable.video_id)
        )
        result = await db.execute(stmt)
        return {row.video_id: row.count for row in result.fetchall()}