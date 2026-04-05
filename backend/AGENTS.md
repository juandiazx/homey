Homey Backend: AI-Powered Real Estate Marketplace
Project Context
Homey is a backend service designed to ingest, normalize, and serve high-quality real estate listings. It transforms unstructured data from external scrapers into structured, searchable assets using LLMs.

Stack: Python (latest), FastAPI, MySQL, SQLAlchemy 2.0+, Alembic migrations.

Package Manager: uv (fast, reliable, and modern).

AI Integration: OpenAI API (parsing unstructured descriptions, deduplication, and semantic search intent).

Infrastructure: Docker & Docker Compose for local orchestration.

Architecture Overview
Layered Architecture
We follow a strict unidirectional flow. If business logic leaks into your controllers, the system will become unmaintainable. Don't let that happen.

Request → Controller → Service → AI/External Scrapers
                 ↓
            Exception Handlers (Global interceptors for clean API responses)
Folder Structure:

app/controllers/: HTTP endpoints. Handles Annotated[] dependencies.

app/services/: The "Brain." Coordinates database operations and business rules.

app/ai/: LLM logic (embedding generation, search query parsing).

app/dependencies/: DI factories for services and external clients.

app/schemas/: Pydantic models (DTOs) with from_attributes=True.

app/core/: The foundation. Contains config.py, logging.py, database.py, container.py, and exceptions/.

Dependency Injection (DI)
We use a centralized AppContainer in app/core/container.py to manage the lifecycle of the MySQL engine and OpenAI clients.

Rule: Never instantiate a database session or an AI client inside a function. Inject them. It makes testing possible and prevents connection leaks.

Exception Handling
We don't use try/except blocks to return 404s.

Throw a custom exception from the Service layer (e.g., ListingNotFoundError).

The global handler in app/core/exceptions/handlers.py catches it.

The client receives a clean, structured JSON error.

Database Strategy (MySQL)
While we use MySQL, we treat data quality with skepticism.

Alembic: Every schema change must be a migration. No manual DB editing.

SQLAlchemy: Use the 2.0 style select() and mapped_column(). Sync sessions via PyMySQL.

Infrastructure (Docker)
We containerize the entire environment to ensure "it works on my machine" actually means something.

Dockerfile:

Uses python:3.12-slim.

Installs uv for lightning-fast dependency resolution.

Copies app/ and sets PYTHONPATH.

Docker Compose:

api: The FastAPI app.

db: MySQL 8.0 instance.

adminer: (Optional) Simple UI to check the data.

Developer Workflows
Setup & Run
Bash

# Install dependencies

uv sync

# Run migrations

uv run alembic upgrade head

# Start with Docker

docker-compose up --build

# Ingest listing data

uv run python -m app.cli ingest scraper/habitaclia/listings.json

AI Integration Standards
Structured Outputs: Always use Pydantic models with OpenAI's response_format to ensure the AI doesn't return garbage.

Embedding Model: text-embedding-3-small (1536 dimensions). Both pre-computed in listings.json and generated at query time for search_intent.

### Sync-First (MVP)

All routes and services use `def` (not `async def`). FastAPI runs them in its threadpool. This avoids needing an async MySQL driver and keeps code simple for an MVP with 99 listings.

### Type Hints & Docstrings

Every function/class requires:

- Full type hints on parameters and return values
- Brief docstring with Args/Returns/Raises sections

### FastAPI Documentation

Use `Annotated[]` with descriptions for auto-generated docs.

Include `summary`, `description`, and `responses` in route decorators. Keep minimalistic - no examples unless necessary.

### Code Style

- **Naming**: `snake_case` for functions/variables, `PascalCase` for classes
- **Formatting and Linting**: Use Ruff with uv run ruff check --fix and uv run ruff format
- **Logging**: Use `logging` module, not `print()`. Minimal, actionable log messages.
- **No mid-code comments**: Self-documenting code preferred; comments only for "why", not "what"
- **Security**: No hardcoded secrets - all config from `.env` via `settings`

## Adding New Features

**Standard workflow**:

1. Create SQLAlchemy model → generate migration (if DB needed)
2. Create Pydantic request/response schemas which use from_model classmethod mappers to map database models
3. Write service logic
4. Create controller endpoint
5. Register router in `app/routes.py`

## Code Quality Principles

- **Architecture**: Follow RESTful API design, DRY, KISS, and Clean Code principles
- **Exception Handling**: Use custom exceptions inheriting from `HomeyError`, minimal try/except blocks
- **Documentation**: No separate markdown docs unless specified - code should be self-documenting

## Key Files Reference

- `app/main.py` - App initialization, middleware, exception handlers, CORS
- `app/routes.py` - Router aggregation
- `app/core/container.py` - Singleton dependency container
- `app/core/database.py` - SQLAlchemy engine + SessionLocal factory
- `app/core/config.py` - Settings from .env
- `app/core/exceptions/` - Exception hierarchy and HTTP handlers
- `app/core/logging.py` - Structured logging with correlation IDs
- `app/cli.py` - CLI ingestion script for listings.json

### Logging Infrastructure

Structured logging with correlation IDs (`app/core/logging.py`):

- Configure once in `main.py` via `configure_root_logger(json_output=True)`
- Middleware adds `correlation_id` to each request (`X-Correlation-ID` header)
- All loggers automatically include correlation ID via `CorrelationIdFilter`
- JSON output in production, human-readable in dev
- **Usage**: `logger = logging.getLogger(__name__)` then `logger.info/error/debug`

### Package for folders

- Create a __init__.py empty file for each folder.
