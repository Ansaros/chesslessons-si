.PHONY: help install dev test clean migrate upgrade-db create-admin init-db

help:
	@echo "Available commands:"
	@echo "  install     - Install dependencies"
	@echo "  dev         - Run development server"
	@echo "  test        - Run tests"
	@echo "  clean       - Clean cache files"
	@echo "  migrate     - Create new migration"
	@echo "  upgrade-db  - Apply migrations"
	@echo "  create-admin - Create admin user"
	@echo "  init-db     - Initialize database"

install:
	pip install -r requirements.txt

dev:
	uvicorn main:app --host 0.0.0.0 --port 8000 --reload

test:
	pytest tests/ -v

clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +

migrate:
	alembic revision --autogenerate -m "$(msg)"

upgrade-db:
	alembic upgrade head

create-admin:
	python scripts/create_admin.py

init-db:
	python scripts/init_db.py

docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f api
