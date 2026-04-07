# Homey

A real estate listings platform that lets you search properties with plain-language queries. Type something like *"bright apartment near the park under 1200"* and the AI parses your intent, runs a vector similarity search against pre-computed embeddings, and returns the most relevant results — ranked by both semantic relevance and listing quality.

## Stack

| Layer | Tech |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy 2.0, Alembic, MySQL 8 |
| AI | OpenAI (`gpt-4o-mini` + `text-embedding-3-small`) |
| Frontend | React 19, Vite, Tailwind CSS, shadcn/ui, React Query |
| Infra | Docker, Docker Compose |

## Features

- **Smart search** — natural language query parsed by an LLM into structured filters, then re-ranked with embedding similarity
- **Classical search** — filter by price, surface, rooms, city, neighborhood, transaction/listing type
- **Listing detail** — full property info with image carousel and map
- **Filter options** — dynamic dropdowns driven by actual data (cities, neighborhoods, ranges)
- **Data ingestion** — CLI tool to load listings from a JSON file exported by a scraper

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/listings/search` | Search listings (supports both filter and smart/semantic search) |
| `GET` | `/listings/{id}` | Get full listing detail |
| `GET` | `/listings/filters/options` | Get distinct values for filter dropdowns |
| `POST` | `/search/genai/parse` | Parse a natural language query into structured filters |

Interactive docs available at `http://localhost:8000/docs` when the API is running.

---

## Setup

### 1. Copy and fill in the environment file

```bash
cp .env.example .env
```

Open `.env` and set your values:

```env
# Required — get yours at https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-key-here

# MySQL credentials (defaults work fine for local dev)
MYSQL_ROOT_PASSWORD=homey_root
MYSQL_DATABASE=homey
MYSQL_USER=homey
MYSQL_PASSWORD=homey_pass

# Local connection string (used when running the backend outside Docker)
DATABASE_URL=mysql+aiomysql://homey:homey_pass@localhost:3306/homey

# CORS — keep as-is for local dev
CORS_ORIGINS=http://localhost:4173
```

> The only value you **must** change is `OPENAI_API_KEY`.

---

## Running the project

### Option A — Everything in Docker (simplest)

```bash
docker compose up -d
```

This starts: MySQL, the FastAPI backend, the React frontend (preview build), and Adminer.

The API container handles everything on first boot automatically: runs migrations and ingests the listing data if the database is empty.

| Service | URL |
|---|---|
| Frontend | http://localhost:4173 |
| API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |
| Adminer (DB UI) | http://localhost:8080 |

---

### Option B — Backend in Docker, frontend locally (recommended for development)

**1. Start just the database:**

```bash
cd backend
docker compose up -d
```

**2. Install backend dependencies and run migrations:**

```bash
uv sync
uv run alembic upgrade head
```

**3. Ingest listing data:**

```bash
uv run python -m app.cli ingest scraper/habitaclia/listings.json
```

**4. Start the API:**

```bash
uv run uvicorn app.main:app --reload
```

**5. In a separate terminal, start the frontend:**

```bash
cd frontend
pnpm install
pnpm dev
```

| Service | URL |
|---|---|
| Frontend (dev, HMR) | http://localhost:5173 |
| API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |
| Adminer (DB UI) | http://localhost:8080 |

---

## Other useful commands

```bash
# Create a new DB migration after changing a model
uv run alembic revision --autogenerate -m "describe your change"

# Apply pending migrations
uv run alembic upgrade head

# Lint and format backend code
uv run ruff check --fix
uv run ruff format
```
