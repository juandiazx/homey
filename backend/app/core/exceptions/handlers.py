"""Centralized exception handlers for FastAPI application."""

import logging

from fastapi import Request, status
from fastapi.responses import JSONResponse

from .exceptions import (
    EmbeddingError,
    HomeyError,
    ListingNotFoundError,
    SearchParseError,
    SearchIntentRequiredError,
)

logger = logging.getLogger(__name__)

INTERNAL_SERVER_ERROR_MESSAGE = "An internal error occurred. Please try again later."


async def listing_not_found_handler(
    request: Request, exc: ListingNotFoundError
) -> JSONResponse:
    logger.warning(
        "Listing not found: %s",
        exc.message,
        extra={"path": request.url.path},
    )
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"message": exc.message},
    )


async def search_intent_required_handler(
    request: Request, exc: SearchIntentRequiredError
) -> JSONResponse:
    logger.error(
        "Search intent required: %s",
        exc.message,
        extra={"path": request.url.path},
    )
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"message": exc.message},
    )


async def search_parse_error_handler(
    request: Request, exc: SearchParseError
) -> JSONResponse:
    logger.error(
        "Search parse failed: %s",
        exc.message,
        extra={"path": request.url.path},
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"message": exc.message},
    )


async def embedding_error_handler(
    request: Request, exc: EmbeddingError
) -> JSONResponse:
    logger.error(
        "Embedding error: %s",
        exc.message,
        extra={"path": request.url.path},
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": INTERNAL_SERVER_ERROR_MESSAGE},
    )


async def homey_error_handler(
    request: Request, exc: HomeyError
) -> JSONResponse:
    logger.error(
        "Homey error: %s",
        exc.message,
        exc_info=exc,
        extra={"path": request.url.path},
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": INTERNAL_SERVER_ERROR_MESSAGE},
    )


async def general_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    logger.exception(
        "Unexpected error: %s",
        str(exc),
        exc_info=exc,
        extra={"path": request.url.path},
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": INTERNAL_SERVER_ERROR_MESSAGE},
    )
