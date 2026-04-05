"""Listing model."""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import Float, Integer, LargeBinary, String, Text, UUID, event, func
from sqlalchemy.orm import Mapped, Session, mapped_column, relationship

from app.db.models.base import Base
from app.schemas.enums import ListingType, TransactionType


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(500))
    transaction_type: Mapped[TransactionType] = mapped_column(
        SQLEnum(TransactionType, name="transaction_type", native_enum=False, create_constraint=True, values_callable=lambda e: [m.value for m in e]),
    )
    listing_type: Mapped[ListingType] = mapped_column(
        SQLEnum(ListingType, name="listing_type", native_enum=False, create_constraint=True, values_callable=lambda e: [m.value for m in e]),
    )
    price: Mapped[int] = mapped_column(Integer)
    surface_m2: Mapped[int] = mapped_column(Integer)
    rooms: Mapped[int] = mapped_column(Integer)
    bathrooms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    floor: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    city: Mapped[str] = mapped_column(String(255))
    neighborhood: Mapped[str] = mapped_column(String(255))
    street: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    description: Mapped[str] = mapped_column(Text)
    description_embedding: Mapped[Optional[bytes]] = mapped_column(LargeBinary, nullable=True)
    quality_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    has_elevator: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    has_terrace: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    has_air_conditioning: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    has_heating: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    has_garage: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    has_furniture: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    year_built: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    source_metadata: Mapped["ListingSourceMetadata"] = relationship(
        back_populates="listing",
        uselist=False,
        cascade="all, delete-orphan",
    )
    images: Mapped[list["ListingImage"]] = relationship(
        back_populates="listing",
        cascade="all, delete-orphan",
        order_by="ListingImage.position",
    )

    def calculate_quality_score(self, image_count: int | None = None) -> int:
        """Compute a 0–10 quality score based on field completeness and content richness.

        Args:
            image_count: Number of images to use in the calculation. When None,
                falls back to the count of already-loaded images on the instance.

        Returns:
            Integer score clamped to [0, 10].
        """
        score = 10.0

        critical_fields = ["price", "surface_m2", "rooms", "bathrooms", "neighborhood", "description", "street"]
        for field in critical_fields:
            if getattr(self, field, None) is None:
                score -= 2

        non_critical = ["floor", "year_built", "has_elevator", "has_garage", "has_heating"]
        for field in non_critical:
            if getattr(self, field, None) is None:
                score -= 0.5

        desc = self.description or ""
        desc_len = len(desc)
        if desc_len < 200:
            score -= 4
        elif desc_len < 500:
            score -= 2
        elif desc_len < 1000:
            score -= 1

        if image_count is None:
            loaded: list = self.__dict__.get("images") or []
            image_count = len(loaded)

        if image_count < 10:
            score -= 2
        elif image_count < 20:
            score -= 1

        return int(round(min(10.0, max(0.0, score))))


@event.listens_for(Session, "before_flush")
def _sync_listing_quality_and_embeddings(session: Session, flush_context: object, instances: object) -> None:
    """Recalculate quality_score for every Listing touched in this flush.

    Also nulls description_embedding on persistent listings whose description
    changed, signalling that the caller must regenerate the embedding via
    ``refresh_listing_embedding`` before the next read.
    """
    from sqlalchemy import inspect as sa_inspect

    from app.db.models.listing_image import ListingImage

    affected: set[Listing] = set()

    for obj in set(session.new) | set(session.dirty):
        if isinstance(obj, Listing):
            affected.add(obj)

    for obj in list(session.new):
        if isinstance(obj, ListingImage) and obj.listing_id is not None:
            parent = next(
                (inst for inst in session.identity_map.values() if isinstance(inst, Listing) and inst.id == obj.listing_id),
                None,
            )
            if parent is not None:
                affected.add(parent)

    for listing in affected:
        loaded_images: list = listing.__dict__.get("images") or []
        pending_count = sum(
            1 for obj in session.new if isinstance(obj, ListingImage) and obj.listing_id == listing.id
        )
        image_count = len(loaded_images) + pending_count

        new_score = listing.calculate_quality_score(image_count=image_count)
        if listing.quality_score != new_score:
            listing.quality_score = new_score

        state = sa_inspect(listing)
        if state.persistent and state.attrs.description.history.has_changes():
            listing.description_embedding = None
