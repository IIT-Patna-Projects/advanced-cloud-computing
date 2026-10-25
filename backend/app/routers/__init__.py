"""API routers package."""

from app.routers.health import router as health_router
from app.routers.products import router as products_router

__all__ = ["health_router", "products_router"]
