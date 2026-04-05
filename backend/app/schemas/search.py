"""Search-related Pydantic schemas."""

import math

from enum import Enum
from typing import Generic, Optional, TypeVar

from pydantic import BaseModel, Field
from app.schemas.listing import TransactionType, ListingType

class SortBy(str, Enum):
    RELEVANCE = "relevance"
    PRICE = "price"
    SURFACE = "surface"


class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"


class ListingSearchParams(BaseModel):
    """Structured filters extracted from a natural language real estate search query in Barcelona, Spain."""

    transaction_type: Optional[TransactionType] = Field(
        default=None,
        description="Whether the listing is for sale or rent. Set to 'buy' for purchase intent, 'rent' for rental intent. Null if not mentioned.",
    )
    listing_type: Optional[ListingType] = Field(
        default=None,
        description="The type of property: 'flat', 'house', 'room', 'penthouse', or 'duplex'. Null if not mentioned.",
    )
    price_min: Optional[int] = Field(
        default=None,
        description="Minimum price in euros extracted as a hard numeric constraint. Null if not mentioned.",
    )
    price_max: Optional[int] = Field(
        default=None,
        description="Maximum price in euros extracted as a hard numeric constraint. Null if not mentioned.",
    )
    surface_min: Optional[int] = Field(
        default=None,
        description="Minimum surface area in square meters extracted as a hard numeric constraint. Null if not mentioned.",
    )
    surface_max: Optional[int] = Field(
        default=None,
        description="Maximum surface area in square meters extracted as a hard numeric constraint. Null if not mentioned.",
    )
    rooms_min: Optional[int] = Field(
        default=None,
        description="Minimum number of rooms extracted as a hard numeric constraint. Null if not mentioned.",
    )
    rooms_max: Optional[int] = Field(
        default=None,
        description="Maximum number of rooms extracted as a hard numeric constraint. Null if not mentioned.",
    )
    city: Optional[str] = Field(
        default=None,
        description="City name. Always set to 'Barcelona' when the user mentions a specific neighborhood, even if the city is not explicitly stated. Null if no location is mentioned.",
    )
    neighborhood: Optional[str] = Field(
        default=None,
        description="Specific neighborhood within Barcelona (e.g. 'Gràcia', 'Eixample', 'Poblenou'). Null if not mentioned.",
    )
    search_intent: Optional[str] = Field(
        default=None,
        description=(
            "A qualitative rephrasing of the query with all numeric constraints removed. "
            "Captures only subjective preferences (e.g. 'bright apartment', 'quiet street', 'modern kitchen') "
            "that will be used for semantic embedding search. "
            "Fix any spelling mistakes or formatting anomalies present in the original text, but preserve its meaning. "
            "Null if the query contains no qualitative preferences."
        ),
    )


class ParseRequest(BaseModel):
    """Input body for the LLM search-parse endpoint."""

    query: str = Field(..., max_length=300, description="The natural language search query to parse.")

class ListingSearchParamsWithPagination(ListingSearchParams):
    sort_by: SortBy = SortBy.RELEVANCE
    sort_order: SortOrder = SortOrder.DESC
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=15, ge=1, le=100)

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper."""

    items: list[T]
    total: int
    page: int
    limit: int
    total_pages: int

    @classmethod
    def create(
        cls, items: list[T], total: int, page: int, limit: int
    ) -> "PaginatedResponse[T]":
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            total_pages=math.ceil(total / limit) if total > 0 else 0,
        )
