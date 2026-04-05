"""LLM-powered search query parser using GPT-4o-mini structured output."""

import logging

from openai import AsyncOpenAI

from app.core.config import settings
from app.core.exceptions.exceptions import SearchParseError
from app.schemas.search import ListingSearchParams

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are a real estate search query parser for Barcelona, Spain. "
    "Extract structured search filters from the user's natural language query. "
    "Each field's description specifies exactly how to populate it. "
    "Leave any field as null if the query provides no information for it."
)


async def parse_search_query(client: AsyncOpenAI, query: str) -> ListingSearchParams:
    """Parse a natural language query into structured filter params.

    Args:
        client: Async OpenAI client.
        query: User's natural language search query (max 200 chars).

    Returns:
        ListingSearchParams with extracted filter fields and search_intent.

    Raises:
        SearchParseError: If the LLM call fails or returns unparseable output.
    """
    try:
        response = await client.responses.parse(
            model=settings.OPENAI_LLM_MODEL,
            input=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": query},
            ],
            text_format=ListingSearchParams,
        )
        if response.output_parsed is None:
            raise ValueError("Model refused to parse the query.")
        return response.output_parsed
    except Exception as e:
        raise SearchParseError(
            message="Failed to parse search query",
            details=str(e),
            original_error=e,
        )
