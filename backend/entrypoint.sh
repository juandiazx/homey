#!/bin/bash
set -e

echo "==> Running Alembic migrations..."
uv run -m alembic upgrade head

echo "==> Checking if listings have been ingested..."
COUNT=$(uv run python -c "
import asyncio
from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def count():
    async with AsyncSessionLocal() as db:
        result = await db.execute(text('SELECT COUNT(*) FROM listings'))
        return result.scalar()

print(asyncio.run(count()))
")

if [ "$COUNT" -eq "0" ]; then
    echo "==> No listings found. Ingesting data from scraper/habitaclia/listings.json..."
    uv run python -m app.cli ingest scraper/habitaclia/listings.json
    echo "==> Ingestion complete."
else
    echo "==> Found $COUNT listings already in database, skipping ingestion."
fi

echo "==> Starting API server..."
exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
