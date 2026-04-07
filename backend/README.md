cd backend
uv sync
sudo docker compose up -d db adminer
uv run -m alembic upgrade head
uv run python -m app.cli ingest scraper/habitaclia/listings.json
uv run uvicorn app.main:app --reload
alembic revision --autogenerate -m "message" # Create migration
