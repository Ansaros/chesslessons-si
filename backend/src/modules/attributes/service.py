from uuid import UUID
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import AttributeValueTable, AttributeTypeTable
from .crud import AttributeTypeDatabase, AttributeValueDatabase
from .schemas import AttributeTypeCreate, AttributeValueCreate, AttributeValueRead, AttributeTypeRead, AttributeTypeSimple

class AttributeService:
    def __init__(
        self, 
        att_database: AttributeTypeDatabase, 
        value_database: AttributeValueDatabase
        ):
        self.att_database = att_database
        self.value_database = value_database

    async def create_type(self, data: AttributeTypeCreate, db: AsyncSession) -> AttributeTypeSimple:
        return await self.att_database.create(db, data)


    async def create_value(self, data: AttributeValueCreate, db: AsyncSession) -> AttributeValueRead:
        return await self.value_database.create(db, data)


    async def get_all_types(self, db: AsyncSession) -> list[AttributeTypeRead]:
        db_objs = await self.att_database.get_objects(
            db,
            return_many=True,
            options=[selectinload(AttributeTypeTable.values)]
        )

        return [
            AttributeTypeRead(
                id=obj.id,
                name=obj.name,
                values=[
                    AttributeValueRead(
                        id=v.id,
                        value=v.value,
                        type_id=v.type_id,
                    ) for v in obj.values
                ]
            ) for obj in db_objs
        ]
     

    async def delete_type(self, id: UUID, db: AsyncSession):
        await self.att_database.remove(db, id=id)


    async def delete_value(self, id: UUID, db: AsyncSession):
        await self.value_database.remove(db, id=id)