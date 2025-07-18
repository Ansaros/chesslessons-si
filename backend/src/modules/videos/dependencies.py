from .crud import VideoDatabase
from .service import VideoService
from src.models import VideoTable
from src.core.dependencies import get_config

def get_video_service() -> VideoService:
    return VideoService(
        config=get_config(),
        database=VideoDatabase(VideoTable),
        )