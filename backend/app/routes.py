"""Router aggregation."""

from fastapi import APIRouter

from app.controllers.listing_controller import router as listing_router
from app.controllers.search_controller import router as search_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(search_router, tags=["search"])
api_router.include_router(listing_router)
