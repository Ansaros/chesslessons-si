from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from .crud import UserDatabase
from src.models import UserTable
from .schemas import UserUpdate, UserCreateInternal

class UserService:
    def __init__(self, database: UserDatabase):
        self.database = database

    async def create_user(self, data: UserCreateInternal, db: AsyncSession) -> UserTable:
        try:
            existing = await self.database.get_objects(db, email=data.email)
            if existing:
                raise HTTPException(status_code=400, detail="User with this email already exists")
        except HTTPException as e:
            if e.status_code != 404:
                raise
            
        return await self.database.create(db, obj_in=data)


    async def get_by_email(self, email: str, db: AsyncSession) -> UserTable:
        return await self.database.get_objects(db, email=email)


    async def update_user_password(self, user_id: UUID, hashed_password: str, db: AsyncSession) -> UserTable:
        user = await self.database.get(db, user_id)
        return await self.database.update(db, db_obj=user, obj_in={"hashed_password": hashed_password})


    async def update(self, user_id: UUID, user_update: UserUpdate, db: AsyncSession) -> UserTable:
        return await self.database.update(db, db_obj=await self.database.get(db, user_id), obj_in=user_update)