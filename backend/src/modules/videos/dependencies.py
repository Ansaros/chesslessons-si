from .utils import VideoUtils
from .crud import VideoDatabase
from .service import VideoService
from src.models import VideoTable
from src.core.dependencies import get_config

def get_video_service() -> VideoService:
    return VideoService(
        config=get_config(),
        database=VideoDatabase(VideoTable),
        utils=VideoUtils(config=get_config()),
        )