"""Search endpoints: unified search and LLM query parsing."""

import logging
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query

from app.dependencies.services import get_search_service
from app.schemas.listing import ListingSummary
from app.schemas.search import (
    ListingSearchParams,
    ListingSearchParamsWithPagination,
    ListingType,
    PaginatedResponse,
    ParseRequest,
    SortBy,
    SortOrder,
    TransactionType,
)
from app.services.search_service import SearchService

logger = logging.getLogger(__name__)

router = APIRouter()

SearchServiceDep = Annotated[SearchService, Depends(get_search_service)]


@router.get(
    "/listings/search",
    response_model=PaginatedResponse[ListingSummary],
    summary="Search listings",
    description="Unified search: filter-based when no search_intent, embedding-reranked when search_intent is present.",
)
async def search_listings(
    service: SearchServiceDep,
    transaction_type: Annotated[Optional[TransactionType], Query()] = None,
    listing_type: Annotated[Optional[ListingType], Query()] = None,
    price_min: Annotated[Optional[int], Query(ge=0)] = None,
    price_max: Annotated[Optional[int], Query(ge=0)] = None,
    surface_min: Annotated[Optional[int], Query(ge=0)] = None,
    surface_max: Annotated[Optional[int], Query(ge=0)] = None,
    rooms_min: Annotated[Optional[int], Query(ge=0)] = None,
    rooms_max: Annotated[Optional[int], Query(ge=0)] = None,
    city: Annotated[Optional[str], Query()] = None,
    neighborhood: Annotated[Optional[str], Query()] = None,
    search_intent: Annotated[Optional[str], Query()] = None,
    sort_by: Annotated[SortBy, Query()] = SortBy.RELEVANCE,
    sort_order: Annotated[SortOrder, Query()] = SortOrder.DESC,
    page: Annotated[int, Query(ge=1)] = 1,
    limit: Annotated[int, Query(ge=1, le=100)] = 15,
):
    params = ListingSearchParamsWithPagination(
        transaction_type=transaction_type,
        listing_type=listing_type,
        price_min=price_min,
        price_max=price_max,
        surface_min=surface_min,
        surface_max=surface_max,
        rooms_min=rooms_min,
        rooms_max=rooms_max,
        city=city,
        neighborhood=neighborhood,
        search_intent=search_intent,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit,
    )

    if params.search_intent:
        return await service.smart_search(params)
    return await service.filter_search(params)


@router.post(
    "/search/genai/parse",
    response_model=ListingSearchParams,
    summary="Parse search query",
    description="Parse natural language search query into structured filters using LLM.",
)
async def parse_query(body: ParseRequest, service: SearchServiceDep):
    return await service.parse_query(body)
