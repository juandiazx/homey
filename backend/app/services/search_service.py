"""Search service: filter-based and smart (embedding) search, and query parsing."""

import numpy as np
from openai import AsyncOpenAI
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ai.embedding import decode_embedding, embed_text
from app.ai.search_parser import parse_search_query
from app.core.exceptions.exceptions import SearchIntentRequiredError
from app.db.models.listing import Listing
from app.schemas.listing import ListingSummary
from app.schemas.search import (
    ListingSearchParams,
    ListingSearchParamsWithPagination,
    PaginatedResponse,
    ParseRequest,
    SortBy,
    SortOrder,
)
from app.utils import (
    combine_similarity_and_quality_scores,
    cosine_similarity,
    paginate_in_memory,
    sort_in_memory,
)

_SQL_SORT_COLUMNS = {
    SortBy.PRICE: Listing.price,
    SortBy.SURFACE: Listing.surface_m2,
    SortBy.RELEVANCE: Listing.quality_score,
}


class SearchService:
    """Service for listing search and natural language query parsing."""

    def __init__(self, session: AsyncSession, openai_client: AsyncOpenAI) -> None:
        """Initialize the search service.

        Args:
            session: Active async database session.
            openai_client: Async OpenAI client for embedding and LLM calls.
        """
        self.session = session
        self.openai_client = openai_client

    def _build_filter_query(self, params: ListingSearchParams):
        """Build a SELECT query with WHERE clauses from search params."""
        query = select(Listing).options(selectinload(Listing.images))

        if params.transaction_type:
            query = query.where(Listing.transaction_type == params.transaction_type.value)
        if params.listing_type:
            query = query.where(Listing.listing_type == params.listing_type.value)
        if params.price_min is not None:
            query = query.where(Listing.price >= params.price_min)
        if params.price_max is not None:
            query = query.where(Listing.price <= params.price_max)
        if params.surface_min is not None:
            query = query.where(Listing.surface_m2 >= params.surface_min)
        if params.surface_max is not None:
            query = query.where(Listing.surface_m2 <= params.surface_max)
        if params.rooms_min is not None:
            query = query.where(Listing.rooms >= params.rooms_min)
        if params.rooms_max is not None:
            query = query.where(Listing.rooms <= params.rooms_max)
        if params.city:
            query = query.where(Listing.city == params.city)
        if params.neighborhood:
            query = query.where(Listing.neighborhood == params.neighborhood)
        return query

    def _apply_sql_sort(self, query, sort_by: SortBy, sort_order: SortOrder):
        """Apply ORDER BY to a SQL query based on sort params.

        Args:
            query: Base SQLAlchemy select query.
            sort_by: Column to sort by.
            sort_order: Ascending or descending direction.

        Returns:
            Query with ORDER BY applied.
        """
        column = _SQL_SORT_COLUMNS[sort_by]
        return query.order_by(column.asc() if sort_order == SortOrder.ASC else column.desc())

    async def _rank_by_relevance_in_smart_search(
        self, listings: list[Listing], search_intent: str
    ) -> list[Listing]:
        """Rank listings by cosine similarity to the search intent embedding.

        Args:
            listings: Candidate listings to rank.
            search_intent: Natural language description of what the user wants.

        Returns:
            Listings sorted by combined embedding + quality score, descending.
        """
        query_vec = np.array(
            await embed_text(self.openai_client, search_intent), dtype=np.float32
        )
        scored: list[tuple[Listing, float]] = []
        for listing in listings:
            if listing.description_embedding:
                listing_vec = np.array(
                    decode_embedding(listing.description_embedding), dtype=np.float32
                )
                sim = cosine_similarity(query_vec, listing_vec)
            else:
                sim = 0.0
            scored.append((listing, combine_similarity_and_quality_scores(sim, listing.quality_score)))

        scored.sort(key=lambda x: x[1], reverse=True)
        return [listing for listing, _ in scored]

    async def filter_search(
        self, params: ListingSearchParamsWithPagination
    ) -> PaginatedResponse[ListingSummary]:
        """SQL-only search with filtering, sorting, and pagination.

        Args:
            params: Validated search parameters.

        Returns:
            Paginated list of ListingSummary DTOs.
        """
        base_query = self._apply_sql_sort(
            self._build_filter_query(params), params.sort_by, params.sort_order
        )

        count_result = await self.session.execute(
            select(func.count()).select_from(base_query.subquery())
        )
        total = count_result.scalar() or 0

        offset = (params.page - 1) * params.limit
        result = await self.session.execute(base_query.offset(offset).limit(params.limit))
        listings = result.scalars().all()

        return PaginatedResponse.create(
            items=[ListingSummary.from_model(listing) for listing in listings],
            total=total,
            page=params.page,
            limit=params.limit,
        )

    async def smart_search(
        self, params: ListingSearchParamsWithPagination
    ) -> PaginatedResponse[ListingSummary]:
        """Embedding-reranked search: SQL filter survivors + cosine similarity or explicit sort.

        When sort_by is RELEVANCE, results are ranked by a combined embedding + quality score.
        Otherwise, survivors are sorted in-memory by the chosen field.

        Args:
            params: Validated search parameters (must include search_intent).

        Returns:
            Paginated list of ListingSummary DTOs.
        """
        if not params.search_intent:
            raise SearchIntentRequiredError(message="Search intent is required for smart search")

        result = await self.session.execute(self._build_filter_query(params))
        survivors = list(result.scalars().all())
        total = len(survivors)

        if total == 0:
            return PaginatedResponse.create(items=[], total=0, page=params.page, limit=params.limit)

        if params.sort_by == SortBy.RELEVANCE:
            sorted_listings = await self._rank_by_relevance_in_smart_search(survivors, params.search_intent)
        else:
            sorted_listings = sort_in_memory(survivors, params.sort_by, params.sort_order)

        page_items = paginate_in_memory(sorted_listings, params.page, params.limit)
        return PaginatedResponse.create(
            items=[ListingSummary.from_model(listing) for listing in page_items],
            total=total,
            page=params.page,
            limit=params.limit,
        )

    async def parse_query(self, body: ParseRequest) -> ListingSearchParams:
        """Parse a natural language query into structured filter params via LLM.

        Args:
            body: ParseRequest containing the raw user query.

        Returns:
            ParseResponse with extracted filter fields and search_intent.

        Raises:
            SearchParseError: If the LLM call fails or returns unparseable output.
        """
        return await parse_search_query(self.openai_client, body.query)
