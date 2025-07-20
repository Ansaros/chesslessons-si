from src.core.crudbase import CRUDBase
from src.models import AttributeTypeTable, AttributeValueTable
from .schemas import AttributeTypeCreate, AttributeTypeCreate, AttributeValueCreate, AttributeValueCreate

class AttributeTypeDatabase(CRUDBase[AttributeTypeTable, AttributeTypeCreate, AttributeTypeCreate]):
    pass

class AttributeValueDatabase(CRUDBase[AttributeValueTable, AttributeValueCreate, AttributeValueCreate]):
    pass
