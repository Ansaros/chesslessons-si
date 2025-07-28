from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import UserTable
from src.core.crudbase import CRUDBase
from .schemas import UserCreateInternal
from src.modules.users.schemas import UserCreate, UserUpdate

class UserDatabase(CRUDBase[UserTable, UserCreate, UserUpdate]):
    async def create(self, db: AsyncSession, obj_in: UserCreateInternal) -> UserTable:
        try:
            return await super().create(db, obj_in=obj_in)
        except IntegrityError as e:
            if 'chess_level_id' in str(e.orig):
                raise HTTPException(status_code=400, detail="chess_level_id: atribute with this id does not exist")
            raise

    async def update(self, db: AsyncSession, db_obj: UserTable, obj_in: UserUpdate) -> UserTable:
        try:
            return await super().update(db, db_obj=db_obj, obj_in=obj_in)
        except IntegrityError as e:
            if 'chess_level_id' in str(e.orig):
                raise HTTPException(status_code=400, detail="chess_level_id: attribute with this id does not exist")
            raise