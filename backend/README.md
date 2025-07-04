# Chess Lessons Backend

FastAPI бэкенд для платформы шахматных уроков.

## 🚀 Быстрый старт

### Установка зависимостей

\`\`\`bash
pip install -r requirements.txt
\`\`\`

### Настройка окружения

Создайте файл `.env`:

\`\`\`env
DATABASE_URL=postgresql://username:password@localhost:5432/chess_lessons
SECRET_KEY=your-super-secret-key
DO_SPACES_KEY=your-do-spaces-key
DO_SPACES_SECRET=your-do-spaces-secret
KASPI_PAY_API_KEY=your-kaspi-api-key
\`\`\`

### Инициализация базы данных

\`\`\`bash
# Создать таблицы и начальные данные
make init-db

# Создать администратора
make create-admin
\`\`\`

### Запуск сервера

\`\`\`bash
# Режим разработки
make dev

# Или напрямую
uvicorn main:app --reload
\`\`\`

## 📚 API Документация

После запуска сервера:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🐳 Docker

\`\`\`bash
# Запуск с Docker Compose
make docker-up

# Остановка
make docker-down
\`\`\`

## 🔧 Команды разработки

\`\`\`bash
# Создать миграцию
make migrate msg="Add new field"

# Применить миграции
make upgrade-db

# Запустить тесты
make test

# Очистить кэш
make clean
\`\`\`

## 📁 Структура проекта

\`\`\`
backend/
├── main.py              # Главный файл приложения
├── models.py            # SQLAlchemy модели
├── schemas.py           # Pydantic схемы
├── database.py          # Настройка БД
├── auth_utils.py        # Аутентификация
├── routers/             # API роутеры
├── services/            # Бизнес-логика
├── middleware/          # Middleware
├── utils/               # Утилиты
├── scripts/             # Скрипты
└── alembic/             # Миграции
\`\`\`

## 🔐 Безопасность

- JWT токены для аутентификации
- Хеширование паролей с bcrypt
- Rate limiting
- Валидация файлов
- CORS настройки

## 📊 Мониторинг

- Логирование всех запросов
- Метрики производительности
- Health check эндпоинт: `/health`

## 🚀 Деплой

1. Настроить продакшен переменные окружения
2. Запустить миграции: `alembic upgrade head`
3. Создать админа: `python scripts/create_admin.py`
4. Запустить сервер: `uvicorn main:app --host 0.0.0.0 --port 8000`
