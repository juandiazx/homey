"""Listing endpoints: detail and filter options."""

import logging
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends

from app.dependencies.services import get_listing_service
from app.schemas.listing import FilterOptions, ListingDetail
from app.services.listing_service import ListingService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/listings", tags=["listings"])

ListingServiceDep = Annotated[ListingService, Depends(get_listing_service)]


@router.get(
    "/filters/options",
    response_model=FilterOptions,
    summary="Get filter options",
    description="Returns distinct values and ranges for search filter dropdowns.",
)
async def get_filter_options(service: ListingServiceDep):
    return await service.get_filter_options()


@router.get(
    "/{listing_id}",
    response_model=ListingDetail,
    summary="Get listing detail",
    description="Returns full listing data with images and source metadata.",
)
async def get_listing(listing_id: str, service: ListingServiceDep):
    return await service.get_by_id(uuid.UUID(listing_id))
