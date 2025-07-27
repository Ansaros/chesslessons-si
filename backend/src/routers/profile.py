from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import UserTable
from src.core.database import get_db
from src.modules.profile.service import ProfileService
from src.modules.auth.dependencies import get_current_user
from src.modules.profile.dependencies import get_profile_service
from src.modules.users.schemas import UserBase, UserUpdate, PasswordUpdate

router = APIRouter()

@router.get("", response_model=UserBase, summary="Get current user profile")
async def get_profile(
    current_user: UserTable = Depends(get_current_user),
):
    return await current_user


@router.put("", response_model=UserBase, summary="Update user profile")
async def update_profile(
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserTable = Depends(get_current_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    return await profile_service.update_user(current_user.id, user_update, db)


@router.put("/password", response_model=UserBase, summary="Update user password")
async def update_password(
    password: PasswordUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserTable = Depends(get_current_user),
    profile_service: ProfileService = Depends(get_profile_service),
):
    return await profile_service.update_user_password(current_user.id, password, db)