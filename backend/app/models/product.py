"""SQLAlchemy 2.0 database model for catalog products."""

from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, Optional
from sqlalchemy import DateTime, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Product(Base):
    """Catalog product entity representing available cloud services.

    Attributes:
        id: Unique product identifier.
        name: Name of cloud infrastructure service.
        category: Service domain (e.g. Compute, Database, Storage).
        description: Comprehensive technical specification summary.
        price: Unit price stored as exact DECIMAL(10, 2).
        stock: Available units in inventory.
        sla: Service level agreement availability guarantee.
        specs: Detailed hardware and network attributes in JSON format.
        image: Path or data URI to product icon or diagram.
        badge: Status or marketing badge label.
        created_at: Timestamp when record was initially created.
    """

    __tablename__ = "products"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    sla: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    specs: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON, nullable=True
    )
    image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    badge: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
