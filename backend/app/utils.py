"""Pure utility functions for search ranking, sorting, and pagination."""

from typing import Any, Callable, TypeVar

import numpy as np

from app.core.config import settings
from app.db.models.listing import Listing
from app.schemas.search import SortBy, SortOrder

T = TypeVar("T")

_SORT_KEYS: dict[SortBy, Callable[[Listing], Any]] = {
    SortBy.PRICE: lambda listing: listing.price or 0,
    SortBy.SURFACE: lambda listing: listing.surface_m2 or 0,
}


def cosine_similarity(query_vec: np.ndarray, listing_vec: np.ndarray) -> float:
    """Compute cosine similarity between two vectors.

    Args:
        query_vec: Query embedding vector.
        listing_vec: Listing embedding vector.

    Returns:
        Similarity score in [-1, 1].
    """
    norm_product = np.linalg.norm(query_vec) * np.linalg.norm(listing_vec)
    return float(np.dot(query_vec, listing_vec) / (norm_product + 1e-10))


def combine_similarity_and_quality_scores(similarity: float, quality_score: float | None) -> float:
    """Combine cosine similarity and listing quality into a single score.

    Args:
        similarity: Cosine similarity between query and listing embeddings.
        quality_score: Raw quality score (0–10) from the listing.

    Returns:
        Weighted combined score.
    """
    normalized_quality = (quality_score or 0.0) / 10.0
    return (
        similarity * settings.SMART_SEARCH_EMBEDDING_WEIGHT
        + normalized_quality * settings.SMART_SEARCH_QUALITY_WEIGHT
    )


def sort_in_memory(
    listings: list[Listing], sort_by: SortBy, sort_order: SortOrder
) -> list[Listing]:
    """Sort a list of listings in memory by a non-relevance field.

    Args:
        listings: Unsorted listing objects.
        sort_by: Field to sort by (PRICE or SURFACE).
        sort_order: Ascending or descending order.

    Returns:
        Sorted list of listings.
    """
    key = _SORT_KEYS[sort_by]
    return sorted(listings, key=key, reverse=(sort_order == SortOrder.DESC))


def paginate_in_memory(items: list[T], page: int, limit: int) -> list[T]:
    """Slice an in-memory list to the requested page.

    Args:
        items: Full list of items.
        page: 1-based page number.
        limit: Items per page.

    Returns:
        Slice of items for the requested page.
    """
    offset = (page - 1) * limit
    return items[offset : offset + limit]
