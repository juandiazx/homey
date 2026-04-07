"""CLI ingestion script: reads listings.json and inserts into all 3 tables."""

import asyncio
import json
import logging
import sys
import uuid

from app.ai.embedding import encode_embedding
from app.db.session import AsyncSessionLocal
from app.core.logging import configure_root_logger
from app.db.models.listing import Listing
from app.db.models.listing_image import ListingImage
from app.db.models.listing_source import ListingSourceMetadata

logger = logging.getLogger(__name__)


async def _ingest(json_path: str) -> None:
    configure_root_logger()
    logger.info("Ingesting listings from %s", json_path)

    with open(json_path) as f:
        data = json.load(f)

    async with AsyncSessionLocal() as db:
        try:
            count = 0
            for item in data:

                embedding_data = None
                raw_embedding = item.get("embedding")
                if raw_embedding:
                    embedding_data = encode_embedding(raw_embedding)

                listing = Listing(
                    title=item["title"],
                    transaction_type=item["transaction_type"],
                    listing_type=item["listing_type"],
                    price=item["price"],
                    surface_m2=item["surface_m2"],
                    rooms=item["rooms"],
                    bathrooms=item.get("bathrooms"),
                    floor=item.get("floor"),
                    city=item["city"],
                    neighborhood=item["neighborhood"],
                    street=item.get("street"),
                    description=item["description"],
                    description_embedding=embedding_data,
                    has_elevator=item.get("has_elevator"),
                    has_terrace=item.get("has_terrace"),
                    has_air_conditioning=item.get("has_air_conditioning"),
                    has_heating=item.get("has_heating"),
                    has_garage=item.get("has_garage"),
                    has_furniture=item.get("has_furniture"),
                    year_built=item.get("year_built"),
                )
                db.add(listing)
                await db.flush()
                
                source = ListingSourceMetadata(
                    listing_id=listing.id,
                    external_id=item["external_id"],
                    source_provider="habitaclia",
                    source_url=item["_source_url"],
                    raw_source_html=item.get("raw_source_html"),
                )
                db.add(source)

                for position, url in enumerate(item.get("image_urls", [])):
                    image = ListingImage(
                        listing_id=listing.id,
                        url=url,
                        position=position,
                    )
                    db.add(image)

                count += 1

            await db.commit()
            logger.info("Successfully ingested %d listings", count)
        except Exception:
            await db.rollback()
            logger.exception("Failed to ingest listings")
            raise


def ingest(json_path: str) -> None:
    asyncio.run(_ingest(json_path))


if __name__ == "__main__":
    if len(sys.argv) < 3 or sys.argv[1] != "ingest":
        print("Usage: python -m app.cli ingest <path/to/listings.json>")
        sys.exit(1)
    ingest(sys.argv[2])
