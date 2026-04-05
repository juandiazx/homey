"""FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.container import get_container, reset_container
from app.core.exceptions.exceptions import (
    EmbeddingError,
    HomeyError,
    ListingNotFoundError,
    SearchParseError,
    SearchIntentRequiredError,
)
from app.core.exceptions.handlers import (
    embedding_error_handler,
    general_exception_handler,
    homey_error_handler,
    listing_not_found_handler,
    search_parse_error_handler,
    search_intent_required_handler,
)
from app.core.logging import configure_root_logger
from app.routes import api_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_root_logger(json_output=settings.LOG_JSON_OUTPUT)
    logger.info("Starting Homey API")
    get_container()
    yield
    logger.info("Shutting down Homey API")
    await reset_container()


app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(ListingNotFoundError, listing_not_found_handler)  # pyright: ignore[reportArgumentType]
app.add_exception_handler(SearchParseError, search_parse_error_handler)  # pyright: ignore[reportArgumentType]
app.add_exception_handler(EmbeddingError, embedding_error_handler)  # pyright: ignore[reportArgumentType]
app.add_exception_handler(HomeyError, homey_error_handler)  # pyright: ignore[reportArgumentType]
app.add_exception_handler(SearchIntentRequiredError, search_intent_required_handler)  # pyright: ignore[reportArgumentType]
app.add_exception_handler(Exception, general_exception_handler)

app.include_router(api_router)
