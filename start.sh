#!/bin/bash

echo "🚀 Starting Chess Lessons Backend..."

# Проверяем переменные окружения
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set"
    exit 1
fi

# Ждем готовности базы данных
echo "⏳ Waiting for database..."
python -c "
import time
import psycopg2
import os
from urllib.parse import urlparse

url = urlparse(os.getenv('DATABASE_URL'))
while True:
    try:
        conn = psycopg2.connect(
            host=url.hostname,
            port=url.port,
            user=url.username,
            password=url.password,
            database=url.path[1:]
        )
        conn.close()
        print('✅ Database is ready!')
        break
    except psycopg2.OperationalError:
        print('⏳ Database not ready, waiting...')
        time.sleep(2)
"

# Применяем миграции
echo "📊 Applying database migrations..."
alembic upgrade head

# Инициализируем базу данных
echo "🔧 Initializing database..."
python scripts/init_db.py

# Запускаем сервер
echo "🎯 Starting FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port 8000
