import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from fastapi import UploadFile, HTTPException
import os
import uuid
from typing import Optional
import mimetypes
from utils.security import sanitize_filename, SecurityUtils

class StorageService:
    def __init__(self):
        try:
            self.client = boto3.client(
                's3',
                endpoint_url=os.getenv('DO_SPACES_ENDPOINT'),
                aws_access_key_id=os.getenv('DO_SPACES_KEY'),
                aws_secret_access_key=os.getenv('DO_SPACES_SECRET'),
                region_name='fra1'
            )
            self.bucket_name = os.getenv('DO_SPACES_BUCKET')
            
            if not all([
                os.getenv('DO_SPACES_ENDPOINT'),
                os.getenv('DO_SPACES_KEY'),
                os.getenv('DO_SPACES_SECRET'),
                os.getenv('DO_SPACES_BUCKET')
            ]):
                raise ValueError("Missing Digital Ocean Spaces configuration")
                
        except NoCredentialsError:
            raise HTTPException(
                status_code=500,
                detail="Digital Ocean Spaces credentials not configured"
            )
    
    async def upload_video(self, video_file: UploadFile) -> str:
        """Загружает видео в Digital Ocean Spaces"""
        try:
            # Проверяем тип файла
            if not SecurityUtils.validate_video_file(video_file.filename):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid video file format"
                )
            
            # Проверяем размер файла (максимум 500MB)
            max_size = 500 * 1024 * 1024  # 500MB
            content = await video_file.read()
            if len(content) > max_size:
                raise HTTPException(
                    status_code=400,
                    detail="Video file too large (max 500MB)"
                )
            
            # Генерируем уникальное имя файла
            file_extension = video_file.filename.split('.')[-1].lower()
            unique_filename = f"videos/{uuid.uuid4()}.{file_extension}"
            
            # Определяем MIME тип
            content_type = mimetypes.guess_type(video_file.filename)[0] or 'video/mp4'
            
            # Загружаем файл
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=unique_filename,
                Body=content,
                ContentType=content_type,
                ACL='private',
                Metadata={
                    'original_filename': sanitize_filename(video_file.filename),
                    'upload_type': 'video'
                }
            )
            
            # Возвращаем URL файла
            return f"{os.getenv('DO_SPACES_ENDPOINT')}/{self.bucket_name}/{unique_filename}"
            
        except ClientError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload video: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Upload error: {str(e)}"
            )
    
    async def upload_thumbnail(self, thumbnail_file: UploadFile) -> str:
        """Загружает превью видео"""
        try:
            # Проверяем тип файла
            if not SecurityUtils.validate_image_file(thumbnail_file.filename):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid image file format"
                )
            
            # Проверяем размер файла (максимум 5MB)
            max_size = 5 * 1024 * 1024  # 5MB
            content = await thumbnail_file.read()
            if len(content) > max_size:
                raise HTTPException(
                    status_code=400,
                    detail="Thumbnail file too large (max 5MB)"
                )
            
            file_extension = thumbnail_file.filename.split('.')[-1].lower()
            unique_filename = f"thumbnails/{uuid.uuid4()}.{file_extension}"
            
            content_type = mimetypes.guess_type(thumbnail_file.filename)[0] or 'image/jpeg'
            
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=unique_filename,
                Body=content,
                ContentType=content_type,
                ACL='public-read',
                Metadata={
                    'original_filename': sanitize_filename(thumbnail_file.filename),
                    'upload_type': 'thumbnail'
                }
            )
            
            return f"{os.getenv('DO_SPACES_ENDPOINT')}/{self.bucket_name}/{unique_filename}"
            
        except ClientError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload thumbnail: {str(e)}"
            )
    
    def generate_presigned_url(self, object_key: str, expiration: int = 3600) -> str:
        """Генерирует временную ссылку для доступа к приватному файлу"""
        try:
            # Извлекаем ключ из полного URL
            if object_key.startswith('http'):
                object_key = object_key.split(f"{self.bucket_name}/")[-1]
            
            response = self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': object_key},
                ExpiresIn=expiration
            )
            return response
        except ClientError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate presigned URL: {str(e)}"
            )
    
    def delete_file(self, object_key: str) -> bool:
        """Удаляет файл из хранилища"""
        try:
            # Извлекаем ключ из полного URL
            if object_key.startswith('http'):
                object_key = object_key.split(f"{self.bucket_name}/")[-1]
                
            self.client.delete_object(Bucket=self.bucket_name, Key=object_key)
            return True
        except ClientError as e:
            print(f"Failed to delete file: {str(e)}")
            return False
    
    def check_file_exists(self, object_key: str) -> bool:
        """Проверяет существование файла"""
        try:
            if object_key.startswith('http'):
                object_key = object_key.split(f"{self.bucket_name}/")[-1]
                
            self.client.head_object(Bucket=self.bucket_name, Key=object_key)
            return True
        except ClientError:
            return False
