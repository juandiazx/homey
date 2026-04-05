"""Custom exceptions for the Homey backend."""

from typing import Optional


class HomeyError(Exception):
    """Base exception for all Homey-related errors."""

    def __init__(
        self,
        message: str,
        details: Optional[str] = None,
        original_error: Optional[Exception] = None,
    ):
        self.message = message
        self.details = details
        self.original_error = original_error
        super().__init__(message)

    def __str__(self) -> str:
        if self.details:
            return f"{self.message} | Details: {self.details}"
        return self.message


class ListingNotFoundError(HomeyError):
    """Raised when a listing is not found."""

    pass


class SearchParseError(HomeyError):
    """Raised when LLM search-query parsing fails."""

    pass


class EmbeddingError(HomeyError):
    """Raised when embedding generation fails."""

    pass


class SearchIntentRequiredError(HomeyError):
    """Raised when search intent is required for smart search."""

    pass