"""Service dependency factories."""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.container import AppContainer, get_container
from app.db.session import get_db_session
from app.services.listing_service import ListingService
from app.services.search_service import SearchService

DbSession = Annotated[AsyncSession, Depends(get_db_session)]


def get_listing_service(session: DbSession) -> ListingService:
    """Factory for ListingService dependency."""
    return ListingService(session=session)


def get_search_service(
    session: DbSession,
    container: Annotated[AppContainer, Depends(get_container)],
) -> SearchService:
    """Factory for SearchService dependency."""
    return SearchService(session=session, openai_client=container.openai_client)
