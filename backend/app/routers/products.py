"""FastAPI router for catalog products endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, Path, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.product import ProductListResponse, ProductResponse
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["products"])


@router.get(
    "",
    response_model=ProductListResponse,
    summary="List products with search, filtering, and pagination",
)
async def list_products(
    search: Optional[str] = Query(
        None, description="Substring search for name or description"
    ),
    category: Optional[str] = Query(
        None, description="Filter by service category"
    ),
    sort: Optional[str] = Query(
        None, description="Sort order: price_asc, price_desc, name_asc, sla"
    ),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(12, ge=1, le=50, description="Items per page"),
    db: AsyncSession = Depends(get_db),
) -> ProductListResponse:
    """Retrieve paginated products matching search, category, and sort.

    Args:
        search: Optional text query to filter product name or description.
        category: Optional category filter string.
        sort: Optional sorting strategy.
        page: Page number requested.
        limit: Maximum number of items returned.
        db: Database session dependency.

    Returns:
        ProductListResponse: Paginated products list with metadata.
    """
    return await ProductService.get_products(
        session=db,
        search=search,
        category=category,
        sort=sort,
        page=page,
        limit=limit,
    )


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Retrieve product details by ID",
    responses={
        200: {"description": "Product details retrieved successfully"},
        404: {
            "description": "Product not found",
            "content": {
                "application/json": {
                    "example": {
                        "error": "Product not found",
                        "code": "PRODUCT_NOT_FOUND",
                        "status": 404,
                    }
                }
            },
        },
    },
)
async def get_product(
    product_id: int = Path(..., ge=1, description="Unique product ID"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full specifications and inventory for a specific product.

    Args:
        product_id: Unique identifier of product.
        db: Database session dependency.

    Returns:
        ProductResponse: Product details if found.
        JSONResponse: 404 error payload if product does not exist.
    """
    product = await ProductService.get_product_by_id(
        session=db, product_id=product_id
    )
    if product is None:
        return JSONResponse(
            status_code=404,
            content={
                "error": "Product not found",
                "code": "PRODUCT_NOT_FOUND",
                "status": 404,
            },
        )
    return product
