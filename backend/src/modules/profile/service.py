from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.users.service import UserService
from src.modules.users.schemas import UserBase, UserUpdate
from src.modules.auth.password_manager import PasswordManager

class ProfileService:
    def __init__(self, user_service: UserService, password_manager: PasswordManager):
        self.user_service = user_service
        self.password_manager = password_manager

    async def update_user(self, user_id: UUID, user_update: UserUpdate, db: AsyncSession) -> UserBase:
        return await self.user_service.update(user_id, user_update, db)
    
    
    async def update_user_password(self, user_id: UUID, password: str, db: AsyncSession) -> UserBase:
        hashed = self.password_manager.hash_password(password)
        return await self.user_service.update_user_password(user_id, hashed, db)