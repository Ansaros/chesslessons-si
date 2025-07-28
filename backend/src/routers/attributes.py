from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.schemas import ListResponse
from src.modules.attributes.service import AttributeService
from src.modules.attributes.schemas import AttributeTypeRead
from src.modules.attributes.dependencies import get_attribute_service

router = APIRouter()

@router.get("/types", response_model=ListResponse[AttributeTypeRead], summary="Get all attribute types")
async def get_attribute_types(
    db: AsyncSession = Depends(get_db),
    attribute_service: AttributeService = Depends(get_attribute_service),
):
    types = await attribute_service.get_all_types(db)
    return ListResponse(data=types, total=len(types))