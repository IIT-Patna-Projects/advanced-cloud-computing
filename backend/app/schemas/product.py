"""Pydantic v2 schemas for product catalog operations."""

from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    """Base fields shared across product schemas."""

    name: str = Field(..., max_length=255, description="Service name")
    category: str = Field(..., max_length=100, description="Service category")
    description: str = Field(..., description="Technical overview and details")
    price: Decimal = Field(
        ..., ge=0, decimal_places=2, description="Price in USD"
    )
    stock: int = Field(default=0, ge=0, description="Available stock units")
    sla: Optional[str] = Field(
        default=None, max_length=255, description="SLA commitment"
    )
    specs: Optional[Dict[str, Any]] = Field(
        default=None, description="Hardware specs"
    )
    image: Optional[str] = Field(
        default=None, max_length=500, description="Image URL or URI"
    )
    badge: Optional[str] = Field(
        default=None, max_length=100, description="Badge text"
    )


class ProductCreate(ProductBase):
    """Schema for administrator product creation."""

    pass


class ProductUpdate(BaseModel):
    """Schema for product updates."""

    name: Optional[str] = Field(default=None, max_length=255)
    category: Optional[str] = Field(default=None, max_length=100)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)
    stock: Optional[int] = Field(default=None, ge=0)
    sla: Optional[str] = Field(default=None, max_length=255)
    specs: Optional[Dict[str, Any]] = None
    image: Optional[str] = Field(default=None, max_length=500)
    badge: Optional[str] = Field(default=None, max_length=100)


class ProductResponse(ProductBase):
    """Response schema representing a single catalog product."""

    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    """Paginated list response containing product records and metadata."""

    items: List[ProductResponse]
    total: int
    page: int
    limit: int
    total_pages: int
