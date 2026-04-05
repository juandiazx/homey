"""Embedding utilities: generation, encoding, and decoding."""

from __future__ import annotations

import logging
import struct
from typing import TYPE_CHECKING

from openai import AsyncOpenAI

from app.core.config import settings
from app.core.exceptions.exceptions import EmbeddingError

if TYPE_CHECKING:
    from app.db.models.listing import Listing

logger = logging.getLogger(__name__)


async def embed_text(client: AsyncOpenAI, text: str) -> list[float]:
    """Generate an embedding vector for the given text.

    Args:
        client: Async OpenAI client.
        text: Input text to embed.

    Returns:
        List of floats (1536 dimensions for text-embedding-3-small).

    Raises:
        EmbeddingError: If the OpenAI API call fails.
    """
    try:
        response = await client.embeddings.create(
            model=settings.OPENAI_EMBEDDING_MODEL,
            input=text,
            dimensions=settings.OPENAI_EMBEDDING_DIMENSIONS,
        )
        return response.data[0].embedding
    except Exception as e:
        raise EmbeddingError(
            message="Failed to generate embedding",
            details=str(e),
            original_error=e,
        )


def encode_embedding(embedding: list[float]) -> bytes:
    """Pack a float list into a compact binary blob for LONGBLOB storage."""
    return struct.pack(f"{len(embedding)}f", *embedding)


def decode_embedding(data: bytes) -> list[float]:
    """Unpack a binary blob back into a float list."""
    n = len(data) // 4
    return list(struct.unpack(f"{n}f", data))