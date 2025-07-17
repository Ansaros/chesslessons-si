from .crud import VideoDatabase
from .service import VideoService
from src.models import VideoTable

def get_video_service() -> VideoService:
    return VideoService(VideoDatabase(VideoTable))