"""Listing-related Pydantic schemas."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.enums import ListingType, TransactionType

if TYPE_CHECKING:
    from app.db.models.listing import Listing

__all__ = ["TransactionType", "ListingType", "ListingImage", "ListingSummary", "ListingDetail", "RangeValues", "FilterOptions"]

class ListingImage(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    url: str
    position: int


class ListingSummary(BaseModel):
    """Compact listing representation for search results."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    transaction_type: TransactionType
    listing_type: ListingType
    price: int
    surface_m2: int
    rooms: int
    bathrooms: Optional[int] = None
    neighborhood: str
    city: str
    quality_score: Optional[float] = None
    description: Optional[str] = None
    cover_image: Optional[ListingImage] = None

    @classmethod
    def from_model(cls, listing: Listing) -> ListingSummary:
        cover = listing.images[0] if listing.images else None
        return cls(
            id=listing.id,
            title=listing.title,
            transaction_type=listing.transaction_type,
            listing_type=listing.listing_type,
            price=listing.price,
            surface_m2=listing.surface_m2,
            rooms=listing.rooms,
            bathrooms=listing.bathrooms,
            neighborhood=listing.neighborhood,
            city=listing.city,
            quality_score=listing.quality_score,
            cover_image=ListingImage.model_validate(cover) if cover else None,
            description=listing.description,
        )


class ListingDetail(BaseModel):
    """Full listing representation for the detail page."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    transaction_type: TransactionType
    listing_type: ListingType
    price: int
    surface_m2: int
    rooms: int
    bathrooms: Optional[int] = None
    floor: Optional[int] = None
    city: str
    neighborhood: str
    street: Optional[str] = None
    description: str
    quality_score: Optional[float] = None
    has_elevator: Optional[bool] = None
    has_terrace: Optional[bool] = None
    has_air_conditioning: Optional[bool] = None
    has_heating: Optional[bool] = None
    has_garage: Optional[bool] = None
    has_furniture: Optional[bool] = None
    year_built: Optional[int] = None
    images: list[ListingImage] = []

    @classmethod
    def from_model(cls, listing: Listing) -> ListingDetail:
        return cls(
            id=listing.id,
            title=listing.title,
            transaction_type=listing.transaction_type,
            listing_type=listing.listing_type,
            price=listing.price,
            surface_m2=listing.surface_m2,
            rooms=listing.rooms,
            bathrooms=listing.bathrooms,
            floor=listing.floor,
            city=listing.city,
            neighborhood=listing.neighborhood,
            street=listing.street,
            description=listing.description,
            quality_score=listing.quality_score,
            has_elevator=listing.has_elevator,
            has_terrace=listing.has_terrace,
            has_air_conditioning=listing.has_air_conditioning,
            has_heating=listing.has_heating,
            has_garage=listing.has_garage,
            has_furniture=listing.has_furniture,
            year_built=listing.year_built,
            images=[ListingImage.model_validate(img) for img in listing.images]
        )


class RangeValues(BaseModel):
    min: int
    max: int


class FilterOptions(BaseModel):
    """Available values for search filter dropdowns."""

    transaction_types: list[TransactionType]
    listing_types: list[ListingType]
    neighborhoods: list[str]
    price_range: RangeValues
    surface_range: RangeValues
    rooms_range: RangeValues
