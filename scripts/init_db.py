#!/usr/bin/env python3
"""
Скрипт для инициализации базы данных
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine
from models import Base
from utils.database_utils import init_database
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    print("=== Инициализация базы данных ===")
    
    try:
        # Создаем таблицы
        print("Создание таблиц...")
        Base.metadata.create_all(bind=engine)
        print("✅ Таблицы созданы")
        
        # Инициализируем данные
        print("Инициализация начальных данных...")
        db = SessionLocal()
        try:
            init_database(db)
            print("✅ База данных инициализирована")
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"❌ Ошибка инициализации: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
