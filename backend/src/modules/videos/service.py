import os
import uuid
import tempfile
import shutil
from uuid import UUID
from typing import Optional
from fastapi import UploadFile
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from .utils import VideoUtils
from .crud import VideoDatabase
from src.core.config import Config
from .schemas import VideoCreate, VideoUpdate, VideoRead, VideoShortRead
from src.models import VideoTable, VideoAttributeLinkTable, AttributeValueTable, UserTable

class VideoService:
    def __init__(
        self,
        config: Config,
        utils: VideoUtils,
        database: VideoDatabase,
    ):
        self.utils = utils
        self.config = config
        self.database = database

    async def create_video(
        self,
        data: VideoCreate,
        video_file: UploadFile,
        preview_file: UploadFile,
        attribute_value_ids: Optional[list[UUID]],
        db: AsyncSession,
    ) -> VideoTable:
        video_id = str(uuid.uuid4())

        with tempfile.TemporaryDirectory() as tmpdir:
            mp4_path = os.path.join(tmpdir, "video.mp4")
            preview_path = os.path.join(tmpdir, "preview.jpg")
            hls_dir = os.path.join(tmpdir, "hls")

            with open(mp4_path, "wb") as f:
                shutil.copyfileobj(video_file.file, f)
            with open(preview_path, "wb") as f:
                shutil.copyfileobj(preview_file.file, f)

            os.makedirs(hls_dir, exist_ok=True)
            self.utils.convert_to_hls(mp4_path, hls_dir)

            preview_key = f"previews/{video_id}.jpg"
            self.utils.upload_to_spaces(preview_key, preview_path, content_type="image/jpeg")

            hls_key_prefix = f"hls/{video_id}/"
            for fname in os.listdir(hls_dir):
                full_path = os.path.join(hls_dir, fname)
                self.utils.upload_to_spaces(hls_key_prefix + fname, full_path)

        base_url = f"{self.config.SPACES_ENDPOINT}/{self.config.SPACES_BUCKET}"
        preview_url = f"{base_url}/{preview_key}"
        hls_url = f"{base_url}/{hls_key_prefix}master.m3u8"

        obj_in = data.model_copy(update={"preview_url": preview_url, "hls_url": hls_url})
        db_obj = await self.database.create(db, obj_in)

        if attribute_value_ids:
            await self.database.add_attributes(db, db_obj.id, attribute_value_ids)

        video_with_attributes = await self.database.get(
            db,
            id=db_obj.id,
            options=[
                selectinload(VideoTable.attributes)
                .selectinload(VideoAttributeLinkTable.attribute_value)
                .selectinload(AttributeValueTable.type)
            ]
        )

        return self.utils.attach_presigned_urls(video_with_attributes)
    

    async def get(self, video_id: UUID, db: AsyncSession) -> VideoRead:
        video = await self.database.get(db, video_id, options=[
            selectinload(VideoTable.attributes)
            .selectinload(VideoAttributeLinkTable.attribute_value)
            .selectinload(AttributeValueTable.type)
        ])

        return self.utils.attach_presigned_urls(video)


    async def get_many(self, skip: int, limit: int, db: AsyncSession) -> list[VideoRead]:
        videos = await self.database.get_multi(db, skip, limit, options=[
            selectinload(VideoTable.attributes)
            .selectinload(VideoAttributeLinkTable.attribute_value)
            .selectinload(AttributeValueTable.type)
        ])

        video_ids = [v.id for v in videos]
        views_map = await self.database.get_views_count_map(db, video_ids)

        return [
            self.utils.attach_presigned_urls(video).model_copy(update={
                "views_count": views_map.get(video.id, 0)
            })
            for video in videos
        ]
    

    async def filter_videos_by_attributes(self, access_level: Optional[int], attribute_value_ids: Optional[list[UUID]], db: AsyncSession) -> tuple[list[VideoShortRead], int]:
        videos = await self.database.filter_by_access_and_attributes(db, access_level, attribute_value_ids)
        return [self.utils.attach_presigned_urls(video) for video in videos]


    async def view_video(self, video_id: UUID, user: UserTable, db: AsyncSession) -> VideoRead:
        video = await self.database.get(db, video_id,
            options=[
                selectinload(VideoTable.attributes)
                .selectinload(VideoAttributeLinkTable.attribute_value)
                .selectinload(AttributeValueTable.type)
            ]
        )

        # TODO: access check
        # if video.access_level == 1: ...
        # if video.access_level == 2: ...

        await self.database.log_view(db, user.id, video_id)

        return self.utils.attach_presigned_urls(video)


    async def update_video(
        self,
        video_id: UUID,
        data: VideoUpdate,
        preview_file: Optional[UploadFile],
        attribute_value_ids: Optional[list[UUID]],
        db: AsyncSession,
    ) -> VideoRead:
        db_obj = await self.database.get(db, video_id)

        if preview_file:
            if db_obj.preview_url:
                old_key = self.utils.extract_key(db_obj.preview_url)
                self.utils.delete_from_spaces(old_key)

            preview_key = f"previews/{video_id}.jpg"
            with tempfile.NamedTemporaryFile(delete=False) as tmp:
                tmp.write(preview_file.file.read())
                tmp.flush()
                self.utils.upload_to_spaces(preview_key, tmp.name, content_type="image/jpeg")

            base_url = f"{self.config.SPACES_ENDPOINT}/{self.config.SPACES_BUCKET}"
            new_preview_url = f"{base_url}/{preview_key}"
            data.preview_url = new_preview_url

        updated = await self.database.update(db, db_obj=db_obj, obj_in=data)

        if attribute_value_ids:
            await self.database.add_attributes(db, updated.id, attribute_value_ids)

        video_with_attributes = await self.database.get(
            db,
            id=updated.id,
            options=[
                selectinload(VideoTable.attributes)
                .selectinload(VideoAttributeLinkTable.attribute_value)
                .selectinload(AttributeValueTable.type)
            ]
        )

        return self.utils.attach_presigned_urls(video_with_attributes)
            

    async def delete_video(self, video_id: UUID, db: AsyncSession) -> VideoRead:
        db_obj = await self.database.get(db, video_id)

        if db_obj.preview_url:
            preview_key = self.utils.extract_key(db_obj.preview_url)
            self.utils.delete_from_spaces(preview_key)

        if db_obj.hls_url:
            hls_prefix = self.utils.extract_key(db_obj.hls_url).rsplit("/", 1)[0] + "/"
            self.utils.delete_prefix_from_spaces(hls_prefix)

        await self.database.remove(db, id=video_id)