"""Listing source metadata model."""

from datetime import datetime
import uuid

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, UUID, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.models import Base, Listing


class ListingSourceMetadata(Base):
    __tablename__ = "listing_source_metadata"
    __table_args__ = (
        UniqueConstraint("external_id", "source_provider", name="uq_external_source"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("listings.id", ondelete="CASCADE"),
        unique=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    external_id: Mapped[str] = mapped_column(String(255))
    source_provider: Mapped[str] = mapped_column(String(255), default="habitaclia")
    source_url: Mapped[str] = mapped_column(String(1000))

    listing: Mapped["Listing"] = relationship(back_populates="source_metadata")
