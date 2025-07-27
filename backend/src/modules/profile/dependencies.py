from .service import ProfileService
from src.modules.users.dependencies import get_user_service
from src.modules.auth.password_manager import PasswordManager

def get_profile_service() -> ProfileService:
    return ProfileService(
        user_service=get_user_service(),
        password_manager=PasswordManager(),
        )