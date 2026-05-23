# Sentinel AI - Command Shortcuts Makefile

.PHONY: setup start-backend start-frontend run-tests reset-db docker-up

setup:
	@echo "Launching cross-platform setup coordinator..."
	python setup.py

start-backend:
	@echo "Starting FastAPI backend server..."
	cd apps/api/src && uvicorn server:app --host 127.0.0.1 --port 8000 --reload

start-frontend:
	@echo "Starting Next.js frontend client..."
	npm run dev

run-tests:
	@echo "Running API endpoint tests..."
	python apps/api/src/test_pipeline.py

reset-db:
	@echo "Resetting local SQLite database..."
	cd apps/api/src && python -c "from config.database import engine; from models import Base; Base.metadata.drop_all(bind=engine)"
	cd apps/api/src && python seed_db.py

docker-up:
	@echo "Spinning up full Docker containers..."
	docker-compose up --build