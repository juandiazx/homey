"""Listing image model."""

from datetime import datetime
import uuid

from sqlalchemy import DateTime, ForeignKey, func, UUID, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.models import Base, Listing

class ListingImage(Base):
    __tablename__ = "listing_images"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("listings.id", ondelete="CASCADE"),
        index=True,
    )
    url: Mapped[str] = mapped_column(String(1000))
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    listing: Mapped["Listing"] = relationship(back_populates="images")
