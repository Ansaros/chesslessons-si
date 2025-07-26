from .service import AttributeService
from .crud import AttributeTypeDatabase, AttributeValueDatabase
from src.models import AttributeTypeTable, AttributeValueTable

def get_attribute_service() -> AttributeService:
    return AttributeService(
        att_database=AttributeTypeDatabase(AttributeTypeTable),
        value_database=AttributeValueDatabase(AttributeValueTable),
    )
