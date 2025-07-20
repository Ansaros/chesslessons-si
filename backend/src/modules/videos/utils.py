import os
import boto3
import subprocess
from botocore.exceptions import ClientError


from src.models import VideoTable
from src.core.config import Config
from src.core.logger import logger
from .schemas import VideoRead, AttributeTypedValueRead


class VideoUtils:
    def __init__(self, config: Config):
        self.config = config
        self.s3 = boto3.client(
            "s3",
            region_name=config.SPACES_REGION,
            endpoint_url=config.SPACES_ENDPOINT,
            aws_access_key_id=config.SPACES_KEY,
            aws_secret_access_key=config.SPACES_SECRET,
        )


    def upload_to_spaces(self, key: str, path: str, content_type: str = "application/octet-stream"):
        self.s3.upload_file(
            Filename=path,
            Bucket=self.config.SPACES_BUCKET,
            Key=key,
            ExtraArgs={"ContentType": content_type},
        )


    def generate_presigned_url(self, key: str, expires: int = 600) -> str:
        try:
            return self.s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.config.SPACES_BUCKET, "Key": key},
                ExpiresIn=expires,
            )
        except ClientError as e:
            from src.core.logger import logger
            logger.error(f"Error generating presigned URL: {e}")
            return ""


    def extract_key(self, url: str) -> str:
        base = f"{self.config.SPACES_ENDPOINT}/{self.config.SPACES_BUCKET}/"
        return url.replace(base, "") if url and url.startswith(base) else ""


    def attach_presigned_urls(self, video: VideoTable) -> VideoRead:
        preview_key = self.extract_key(video.preview_url)
        hls_key = self.extract_key(video.hls_url)

        attributes = []
        for link in video.attributes or []:
            val = link.attribute_value
            if val and val.type:
                attributes.append(AttributeTypedValueRead(
                    type=val.type.name,
                    value=val.value
                ))

        return VideoRead(
            id=video.id,
            title=video.title,
            description=video.description,
            preview_url=self.generate_presigned_url(preview_key),
            hls_url=self.generate_presigned_url(hls_key),
            access_level=video.access_level,
            level_required=video.level_required,
            price=video.price,
            category_id=video.category_id,
            created_at=video.created_at,
            attributes=attributes
        )


    def convert_to_hls(self, input_path: str, output_dir: str):
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
        subprocess.run(command, check=True)


    def delete_from_spaces(self, key: str) -> None:
        try:
            self.s3.delete_object(
                Bucket=self.config.SPACES_BUCKET,
                Key=key
            )
        except ClientError as e:
            logger.warning(f"Не удалось удалить файл из Spaces ({key}): {e}")


    def delete_prefix_from_spaces(self, prefix: str) -> None:
        try:
            response = self.s3.list_objects_v2(
                Bucket=self.config.SPACES_BUCKET,
                Prefix=prefix
            )
            for obj in response.get("Contents", []):
                self.delete_from_spaces(obj["Key"])
        except ClientError as e:
            logger.warning(f"Ошибка при удалении объектов по префиксу '{prefix}': {e}")
