from fastapi import APIRouter

from src.routers.auth import router as auth_router
from src.routers.admin import router as admin_router
from src.routers.videos import router as videos_router
from src.routers.profile import router as profile_router
from src.routers.attributes import router as attributes_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["Authorization"])
router.include_router(admin_router, prefix="/admin", tags=["Admin"])
router.include_router(videos_router, prefix="/videos", tags=["Videos"])
router.include_router(profile_router, prefix="/profile", tags=["Profile"])
router.include_router(attributes_router, prefix="/attributes", tags=["Attributes"])