from fastapi import APIRouter

from src.routers.auth import router as auth_router
from src.routers.admin import router as admin_router
# from src.routers.videos import router as videos_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["Authorization"])
router.include_router(admin_router, prefix="/admin", tags=["Admin"])
# router.include_router(videos_router, prefix="/videos", tags=["Videos"])