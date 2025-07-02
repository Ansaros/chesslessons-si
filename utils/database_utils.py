from sqlalchemy.orm import Session
from models import User, UserRole
from auth_utils import get_password_hash
import logging

logger = logging.getLogger(__name__)

def create_admin_user(db: Session, email: str, username: str, password: str, full_name: str = None):
    """Создает администратора"""
    try:
        # Проверяем, существует ли уже админ
        existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if existing_admin:
            logger.info("Admin user already exists")
            return existing_admin
        
        # Создаем админа
        admin_user = User(
            email=email,
            username=username,
            full_name=full_name or "Administrator",
            hashed_password=get_password_hash(password),
            role=UserRole.ADMIN,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        logger.info(f"Admin user created: {email}")
        return admin_user
        
    except Exception as e:
        logger.error(f"Failed to create admin user: {str(e)}")
        db.rollback()
        raise

def init_database(db: Session):
    """Инициализирует базу данных начальными данными"""
    try:
        # Создаем категории по умолчанию
        from models import Category
        
        default_categories = [
            {"name": "Дебюты", "slug": "debuts", "description": "Изучение шахматных дебютов"},
            {"name": "Миттельшпиль", "slug": "middlegame", "description": "Стратегия и тактика в середине игры"},
            {"name": "Эндшпиль", "slug": "endgame", "description": "Техника игры в окончаниях"},
            {"name": "Тактика", "slug": "tactics", "description": "Тактические приемы и комбинации"},
            {"name": "Стратегия", "slug": "strategy", "description": "Стратегическое планирование"},
        ]
        
        for cat_data in default_categories:
            existing_cat = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if not existing_cat:
                category = Category(**cat_data)
                db.add(category)
        
        db.commit()
        logger.info("Database initialized with default categories")
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        db.rollback()
        raise
