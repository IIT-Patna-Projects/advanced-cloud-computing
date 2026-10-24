"""Tests for backend health check and documentation endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_endpoint(async_client: AsyncClient) -> None:
    """Verify that /health returns HTTP 200 and expected schema fields."""
    response = await async_client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert "app_env" in data
    assert data["version"] == "0.1.0"
    assert data["database"] in ("connected", "disconnected")


@pytest.mark.asyncio
async def test_openapi_docs_endpoint(async_client: AsyncClient) -> None:
    """Verify that /docs and /openapi.json are accessible."""
    docs_response = await async_client.get("/docs")
    assert docs_response.status_code == 200

    schema_response = await async_client.get("/openapi.json")
    assert schema_response.status_code == 200
    schema = schema_response.json()
    assert schema["info"]["title"] == "ShopScale API"
    assert "/health" in schema["paths"]
