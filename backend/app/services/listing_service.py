"""Listing service: detail retrieval and filter option aggregation."""

import uuid
from sqlalchemy import distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions.exceptions import ListingNotFoundError
from app.db.models.listing import Listing
from app.schemas.listing import FilterOptions, ListingDetail, RangeValues


class ListingService:
    """Service for listing detail and filter option operations."""

    def __init__(self, session: AsyncSession) -> None:
        """Initialize the listing service.

        Args:
            session: Active async database session.
        """
        self.session = session

    async def get_by_id(self, listing_id: uuid.UUID) -> ListingDetail:
        """Fetch a single listing with images and source metadata.

        Args:
            listing_id: UUID of the listing.

        Returns:
            Full ListingDetail DTO.

        Raises:
            ListingNotFoundError: If no listing matches the given id.
        """
        result = await self.session.execute(
            select(Listing)
            .options(selectinload(Listing.images), selectinload(Listing.source_metadata))
            .where(Listing.id == listing_id)
        )
        listing = result.scalar_one_or_none()

        if not listing:
            raise ListingNotFoundError(f"Listing {listing_id} not found")

        return ListingDetail.from_model(listing)

    async def get_filter_options(self) -> FilterOptions:
        """Aggregate distinct values and numeric ranges for filter dropdowns.

        Returns:
            FilterOptions with all dropdown values and ranges.
        """
        ranges_result = await self.session.execute(
            select(
                func.min(Listing.price),
                func.max(Listing.price),
                func.min(Listing.surface_m2),
                func.max(Listing.surface_m2),
                func.min(Listing.rooms),
                func.max(Listing.rooms),
            )
        )
        ranges = ranges_result.one()

        transaction_types = [
            row[0]
            for row in (
                await self.session.execute(select(distinct(Listing.transaction_type)))
            ).all()
        ]
        listing_types = [
            row[0]
            for row in (
                await self.session.execute(select(distinct(Listing.listing_type)))
            ).all()
        ]
        neighborhoods = [
            row[0]
            for row in (
                await self.session.execute(
                    select(distinct(Listing.neighborhood)).order_by(Listing.neighborhood)
                )
            ).all()
        ]

        return FilterOptions(
            transaction_types=transaction_types,
            listing_types=listing_types,
            neighborhoods=neighborhoods,
            price_range=RangeValues(min=ranges[0] or 0, max=ranges[1] or 0),
            surface_range=RangeValues(min=ranges[2] or 0, max=ranges[3] or 0),
            rooms_range=RangeValues(min=ranges[4] or 0, max=ranges[5] or 0),
        )
