import secrets
import string
from typing import Optional
from fastapi import HTTPException, status
import re

def generate_secure_token(length: int = 32) -> str:
    """Генерирует безопасный токен"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def validate_password_strength(password: str) -> bool:
    """Проверяет силу пароля"""
    if len(password) < 8:
        return False
    
    # Проверяем наличие цифр, букв и спецсимволов
    has_digit = re.search(r'\d', password)
    has_letter = re.search(r'[a-zA-Z]', password)
    has_special = re.search(r'[!@#$%^&*(),.?":{}|<>]', password)
    
    return bool(has_digit and has_letter and has_special)

def sanitize_filename(filename: str) -> str:
    """Очищает имя файла от опасных символов"""
    # Удаляем опасные символы
    safe_chars = re.sub(r'[^\w\-_\.]', '_', filename)
    return safe_chars[:255]  # Ограничиваем длину

class SecurityUtils:
    @staticmethod
    def check_file_type(filename: str, allowed_types: list) -> bool:
        """Проверяет тип файла по расширению"""
        if not filename:
            return False
        
        extension = filename.lower().split('.')[-1]
        return extension in allowed_types
    
    @staticmethod
    def validate_video_file(filename: str) -> bool:
        """Проверяет, является ли файл видео"""
        video_extensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
        return SecurityUtils.check_file_type(filename, video_extensions)
    
    @staticmethod
    def validate_image_file(filename: str) -> bool:
        """Проверяет, является ли файл изображением"""
        image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
        return SecurityUtils.check_file_type(filename, image_extensions)
