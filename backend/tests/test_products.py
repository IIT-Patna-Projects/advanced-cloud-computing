"""Tests for product catalog list, search, pagination, and detail endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_products_default_pagination(
    async_client: AsyncClient,
) -> None:
    """Verify that GET /products returns HTTP 200 and paginated structure."""
    response = await async_client.get("/products")
    assert response.status_code == 200

    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "limit" in data
    assert "total_pages" in data

    assert data["total"] >= 12
    assert data["page"] == 1
    assert data["limit"] == 12
    assert len(data["items"]) == 12

    # Check structure of first item
    first = data["items"][0]
    assert "id" in first
    assert "name" in first
    assert "category" in first
    assert "price" in first
    assert "stock" in first
    assert "specs" in first


@pytest.mark.asyncio
async def test_search_products(async_client: AsyncClient) -> None:
    """Verify that GET /products?search=... filters products by keyword."""
    response = await async_client.get("/products?search=EC2")
    assert response.status_code == 200

    data = response.json()
    assert data["total"] >= 1
    for item in data["items"]:
        match = (
            "ec2" in item["name"].lower()
            or "ec2" in item["description"].lower()
        )
        assert match


@pytest.mark.asyncio
async def test_category_filter_products(async_client: AsyncClient) -> None:
    """Verify that GET /products?category=... filters products by category."""
    response = await async_client.get("/products?category=Database")
    assert response.status_code == 200

    data = response.json()
    assert data["total"] >= 1
    for item in data["items"]:
        assert item["category"] == "Database"


@pytest.mark.asyncio
async def test_sort_products_price_asc(async_client: AsyncClient) -> None:
    """Verify that GET /products?sort=price_asc orders by price ascending."""
    response = await async_client.get("/products?sort=price_asc&limit=12")
    assert response.status_code == 200

    data = response.json()
    prices = [float(item["price"]) for item in data["items"]]
    assert prices == sorted(prices)


@pytest.mark.asyncio
async def test_pagination_boundaries(async_client: AsyncClient) -> None:
    """Verify that pagination offset and limit correctly slice results."""
    response = await async_client.get("/products?page=2&limit=5")
    assert response.status_code == 200

    data = response.json()
    assert data["page"] == 2
    assert data["limit"] == 5
    assert len(data["items"]) == 5
    assert data["total_pages"] >= 3


@pytest.mark.asyncio
async def test_get_product_detail_success(async_client: AsyncClient) -> None:
    """Verify that GET /products/{id} returns single product details."""
    response = await async_client.get("/products/1")
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == 1
    assert data["name"] == "AWS EC2 c6i.2xlarge Compute Node"
    assert data["category"] == "Compute"
    assert float(data["price"]) == 49.99
    assert data["stock"] == 42
    assert "specs" in data
    assert data["specs"]["vCPU"] == "8 vCPU"


@pytest.mark.asyncio
async def test_get_product_detail_not_found(async_client: AsyncClient) -> None:
    """Verify that GET /products/{id} with non-existent ID returns HTTP 404."""
    response = await async_client.get("/products/999")
    assert response.status_code == 404

    data = response.json()
    assert data["status"] == 404
    assert data["code"] == "PRODUCT_NOT_FOUND"
    assert "error" in data


@pytest.mark.asyncio
async def test_openapi_schema_contains_products(
    async_client: AsyncClient,
) -> None:
    """Verify that OpenAPI schema exposes product endpoints."""
    response = await async_client.get("/openapi.json")
    assert response.status_code == 200

    schema = response.json()
    assert "/products" in schema["paths"]
    assert "/products/{product_id}" in schema["paths"]
