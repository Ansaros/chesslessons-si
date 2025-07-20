from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from .crud import AttributeTypeDatabase, AttributeValueDatabase
from .schemas import AttributeTypeCreate, AttributeValueCreate

class AttributeService:
    def __init__(
        self, 
        att_database: AttributeTypeDatabase, 
        value_database: AttributeValueDatabase
        ):
        self.att_database = att_database
        self.value_database = value_database

    async def create_type(self, data: AttributeTypeCreate, db: AsyncSession):
        return await self.att_database.create(db, data)

    async def create_value(self, data: AttributeValueCreate, db: AsyncSession):
        return await self.value_database.create(db, data)

    async def get_all_types(self, db: AsyncSession):
        return await self.att_database.get_multi(db)

    async def get_values_by_type(self, type_id: UUID, db: AsyncSession):
        return await self.value_database.get_objects(db, return_many=True, type_id=type_id)
    
    async def delete_type(self, id: UUID, db: AsyncSession):
        return await self.att_database.remove(db, id=id)

    async def delete_value(self, id: UUID, db: AsyncSession):
        return await self.value_database.remove(db, id=id)