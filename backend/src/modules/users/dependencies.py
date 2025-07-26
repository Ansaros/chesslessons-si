from .crud import UserDatabase
from .service import UserService
from src.models import UserTable

def get_user_service() -> UserService:
    return UserService(UserDatabase(UserTable))