#!/usr/bin/env python3
"""
Скрипт для создания администратора
Использование: python scripts/create_admin.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from utils.database_utils import create_admin_user
import getpass

def main():
    print("=== Создание администратора ===")
    
    email = input("Email администратора: ")
    username = input("Username администратора: ")
    full_name = input("Полное имя (необязательно): ") or None
    
    while True:
        password = getpass.getpass("Пароль: ")
        password_confirm = getpass.getpass("Подтвердите пароль: ")
        
        if password == password_confirm:
            break
        else:
            print("Пароли не совпадают. Попробуйте снова.")
    
    db = SessionLocal()
    try:
        admin = create_admin_user(
            db=db,
            email=email,
            username=username,
            password=password,
            full_name=full_name
        )
        print(f"✅ Администратор создан успешно: {admin.email}")
        
    except Exception as e:
        print(f"❌ Ошибка при создании администратора: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
