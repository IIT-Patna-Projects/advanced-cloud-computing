"""Health check API router providing system metadata and database readiness."""

from fastapi import APIRouter
from app.config import get_settings
from app.database import check_database_connection
from app.schemas.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Check service health and database connectivity",
    description=(
        "Returns application operational status, environment, version, "
        "and active database connection state."
    ),
)
async def get_health() -> HealthResponse:
    """Return system readiness, app environment, and database status.

    Returns:
        HealthResponse: Health status payload.
    """
    settings = get_settings()
    is_db_connected = await check_database_connection()
    db_status = "connected" if is_db_connected else "disconnected"

    return HealthResponse(
        status="ok",
        app_env=settings.app_env,
        version="0.1.0",
        database=db_status,
    )
