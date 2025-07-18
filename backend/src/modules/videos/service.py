import os
import uuid

import boto3
from botocore.exceptions import ClientError

import shutil
import asyncio
import tempfile
from uuid import UUID
from decimal import Decimal
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import UploadFile

from .schemas import VideoRead
from src.models import VideoTable
from src.core.logger import logger
from src.core.config import Config
from src.modules.videos.crud import VideoDatabase
from src.modules.videos.schemas import VideoUpdate

class VideoService:
    def __init__(self, database: VideoDatabase, config: Config):
        self.config = config
        self.database = database
        self.s3 = boto3.client(
            "s3",
            region_name=config.SPACES_REGION,
            endpoint_url=config.SPACES_ENDPOINT,
            aws_access_key_id=config.SPACES_KEY,
            aws_secret_access_key=config.SPACES_SECRET,
        )

    async def create_video(
        self,
        db: AsyncSession,
        title: str,
        description: Optional[str],
        access_level: int,
        level_required: Optional[str],
        price: Optional[float],
        category_id: Optional[str],
        video_file: UploadFile,
        preview_file: UploadFile,
    ) -> VideoTable:
        video_id = str(uuid.uuid4())

        with tempfile.TemporaryDirectory() as tmpdir:
            mp4_path = os.path.join(tmpdir, "video.mp4")
            preview_path = os.path.join(tmpdir, "preview.jpg")
            hls_dir = os.path.join(tmpdir, "hls")

            # Save uploaded files temporarily
            with open(mp4_path, "wb") as f:
                shutil.copyfileobj(video_file.file, f)
            with open(preview_path, "wb") as f:
                shutil.copyfileobj(preview_file.file, f)

            # Convert mp4 to HLS
            os.makedirs(hls_dir, exist_ok=True)
            await self._convert_to_hls(mp4_path, hls_dir)

            # Upload preview
            preview_key = f"previews/{video_id}.jpg"
            self._upload_to_spaces(preview_key, preview_path, content_type="image/jpeg")

            # Upload HLS files
            hls_key_prefix = f"hls/{video_id}/"
            for fname in os.listdir(hls_dir):
                full_path = os.path.join(hls_dir, fname)
                self._upload_to_spaces(hls_key_prefix + fname, full_path)

        # Compose URLs
        base_url = f"{self.config.SPACES_ENDPOINT}/{self.config.SPACES_BUCKET}"
        preview_url = f"{base_url}/{preview_key}"
        hls_url = f"{base_url}/{hls_key_prefix}master.m3u8"

        # Save to DB
        return await self.database.create(
            db,
            {
                "title": title,
                "description": description,
                "access_level": access_level,
                "level_required": level_required,
                "price": Decimal(price) if price is not None else None,
                "category_id": category_id,
                "preview_url": preview_url,
                "hls_url": hls_url,
            },
        )

    async def _convert_to_hls(self, input_path: str, output_dir: str):
        command = [
            "ffmpeg",
            "-i", input_path,
            "-c:v", "copy",
            "-c:a", "copy",
            "-start_number", "0",
            "-hls_time", "10",
            "-hls_list_size", "0",
            "-f", "hls",
            os.path.join(output_dir, "master.m3u8"),
        ]
        process = await asyncio.create_subprocess_exec(*command)
        await process.communicate()

    def _upload_to_spaces(self, key: str, path: str, content_type: str = "application/octet-stream"):
        self.s3.upload_file(
            Filename=path,
            Bucket=self.config.SPACES_BUCKET,
            Key=key,
            ExtraArgs={"ContentType": content_type},
        )

    async def get_by_id(self, video_id: UUID, db: AsyncSession) -> VideoTable:
        return await self.database.get(db, video_id)

    async def get_many(self, skip: int, limit: int, db: AsyncSession) -> list[VideoRead]:
        videos = await self.database.get_multi(db, skip, limit)
        return [self._attach_presigned_urls(video) for video in videos]

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

    def _generate_presigned_url(self, key: str, expires: int = 600) -> str:
        try:
            return self.s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.config.SPACES_BUCKET, "Key": key},
                ExpiresIn=expires,
            )
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {e}")
            return ""

    def _attach_presigned_urls(self, video: VideoTable) -> VideoRead:
        def extract_key(url: str) -> str:
            base = f"{self.config.SPACES_ENDPOINT}/{self.config.SPACES_BUCKET}/"
            return url.replace(base, "") if url and url.startswith(base) else ""

        preview_key = extract_key(video.preview_url)
        hls_key = extract_key(video.hls_url)

        return VideoRead(
            id=video.id,
            title=video.title,
            description=video.description,
            preview_url=self._generate_presigned_url(preview_key),
            hls_url=self._generate_presigned_url(hls_key),
            access_level=video.access_level,
            level_required=video.level_required,
            price=video.price,
            category_id=video.category_id,
            created_at=video.created_at,
        )
