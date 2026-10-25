"""Service layer for catalog products query execution and fallback data."""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional
import math
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.schemas.product import ProductListResponse, ProductResponse

# Deterministic baseline catalog matching client models and database seed
SEED_PRODUCTS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "name": "AWS EC2 c6i.2xlarge Compute Node",
        "category": "Compute",
        "description": (
            "High performance compute instance powered by 3rd Gen Intel "
            "Xeon Scalable processors."
        ),
        "price": Decimal("49.99"),
        "stock": 42,
        "sla": "99.99% Availability SLA",
        "specs": {
            "vCPU": "8 vCPU",
            "Memory": "16 GiB RAM",
            "Network": "Up to 12.5 Gbps",
            "Storage": "EBS-Only",
        },
        "image": "/images/ec2.svg",
        "badge": "Scalable",
        "created_at": datetime(2026, 10, 24, 0, 0, 0, tzinfo=timezone.utc),
    },
    {
        "id": 2,
        "name": "Amazon Aurora MySQL Serverless v2",
        "category": "Database",
        "description": (
            "On-demand auto-scaling database with instant ACU adjustments "
            "for fluctuating workloads."
        ),
        "price": Decimal("89.50"),
        "stock": 35,
        "sla": "99.99% Availability SLA",
        "specs": {
            "Capacity": "0.5 - 128 ACUs",
            "Engine": "MySQL 8.0 Compatible",
            "Replication": "Multi-AZ Clustered",
            "Storage": "Dynamic Auto-Expanding",
        },
        "image": "/images/aurora.svg",
        "badge": "ACID Clustered",
        "created_at": datetime(2026, 10, 24, 0, 0, 0, tzinfo=timezone.utc),
    },
    {
        "id": 3,
        "name": "Amazon S3 Intelligent-Tiering Storage",
        "category": "Storage",
        "description": (
            "Automated cost-optimized cloud object store with millisecond "
            "access latency."
        ),
        "price": Decimal("24.00"),
        "stock": 80,
        "sla": "99.999999999% Durability",
        "specs": {
            "Tiers": "Frequent, Infrequent, Archive",
            "Encryption": "AES-256 Server-Side",
            "Throughput": "100+ Gbps Aggregate",
            "Durability": "11 9s Durability",
        },
        "image": "/images/s3.svg",
        "badge": "High Durability",
        "created_at": datetime(2026, 10, 24, 0, 0, 0, tzinfo=timezone.utc),
    },
    {
        "id": 4,
        "name": "AWS CloudFront Edge Accelerator",
        "category": "Networking",
        "description": (
            "Global Content Delivery Network delivering sub-50ms latency "
            "with automated DDoS protection."
        ),
        "price": Decimal("35.00"),
        "stock": 60,
        "sla": "99.9% Availability SLA",
        "specs": {
            "Edge PoPs": "600+ Global Locations",
            "Security": "AWS Shield Standard & WAF",
            "Protocol": "HTTP/3 & IPv6 Enabled",
            "TLS": "Custom ACM Certificates",
        },
        "image": "/images/cloudfront.svg",
        "badge": "Global Edge",
        "created_at": datetime(2026, 10, 24, 0, 0, 0, tzinfo=timezone.utc),
    },
    {
        "id": 5,
        "name": "AWS Lambda Serverless Compute Cluster",
        "category": "Compute",
        "description": (
            "Zero-maintenance serverless execution units scaling "
            "automatically from zero to thousands."
        ),
        "price": Decimal("19.99"),
        "stock": 100,
        "sla": "99.95% Availability SLA",
        "specs": {
            "Concurrency": "1,000 Unreserved Burst",
            "Memory": "128 MB to 10,240 MB",
            "Timeout": "Up to 15 Minutes",
            "Runtimes": "Python, Node.js, Go",
        },
        "image": "/images/lambda.svg",
        "badge": "Zero Cold-Start",
        "created_at": datetime(2026, 10, 24, 0, 0, 0, tzinfo=timezone.utc),
    },
    {
        "id": 6,
        "name": "Amazon ElastiCache Redis Cluster",
        "category": "Database",
        "description": (
            "Ultra-low sub-millisecond in-memory cache supporting high "
            "throughput session stores."
        ),
        "price": Decimal("45.00"),
        "stock": 25,
        "sla": "99.99% Availability SLA",
        "specs": {
            "Engine": "Redis 7.1 OSS",
            "Memory": "13.07 GiB Usable",
            "Clustering": "Auto-Failover Sharded",
            "Encryption": "At-Rest and In-Transit",
        },
        "image": "/images/elasticache.svg",
        "badge": "Sub-ms Latency",
        "created_at": datetime(2026, 10, 24, 0, 0, 0, tzinfo=timezone.utc),
    },
    {
        "id": 7,
        "name": "Amazon OpenSearch Analytics Cluster",
        "category": "AI / ML",
        "description": (
            "Distributed real-time search engine and semantic vector database "
            "for enterprise discovery."
        ),
        "price": Decimal("75.00"),
        "stock": 18,
        "sla": "99.9% Availability SLA",
        "specs": {
            "Instance Type": "2x r6g.large.search",
            "Storage": "100 GiB GP3 Volume",
            "Vector Search": "k-NN Algorithms Supported",
            "Observability": "Kibana & Dashboards",
        },
        "image": "/images/opensearch.svg",
        "badge": "Vector Search",
        "created_at": datetime(2026, 10, 24, 0, 0, 0, tzinfo=timezone.utc),
    },
    {
        "id": 8,
        "name": "AWS Application Load Balancer (ALB)",
        "category": "Networking",
        "description": (
            "Layer 7 intelligent reverse-proxy with content-based path "
            "routing and health checks."
        ),
        "price": Decimal("22.50"),
        "stock": 50,
        "sla": "99.99% Availability SLA",
        "specs": {
            "Routing": "Path, Host, and Header Based",
            "Target Groups": "EC2, ECS, and Lambda",
            "Throughput": "Auto-scaling LCU capacity",
            "Certificates": "SNI Multiple SSL Binding",
        },
        "image": "/images/alb.svg",
        "badge": "Layer 7 Proxy",
        "created_at": datetime(2026, 10, 24, 0, 0, 0, tzinfo=timezone.utc),
    },
    {
        "id": 9,
        "name": "Amazon SageMaker Inference Endpoint",
        "category": "AI / ML",
        "description": (
            "Production model serving environment with GPU acceleration "
            "and dynamic traffic splitting."
        ),
        "price": Decimal("120.00"),
        "stock": 15,
        "sla": "99.95% Availability SLA",
        "specs": {
            "Accelerator": "NVIDIA T4 Tensor Core",
            "Frameworks": "PyTorch, HuggingFace, ONNX",
            "Scaling": "Auto-scaling on Invocation Queue",
            "Deployment": "Blue/Green Shadow Testing",
        },
        "image": "/images/sagemaker.svg",
        "badge": "GPU Accelerated",
        "created_at": datetime(2026, 10, 24, 0, 0, 0, tzinfo=timezone.utc),
    },
    {
        "id": 10,
        "name": "Amazon EBS io2 Block Storage",
        "category": "Storage",
        "description": (
            "Extreme performance SSD block volumes engineered for "
            "mission-critical transactional databases."
        ),
        "price": Decimal("65.00"),
        "stock": 40,
        "sla": "99.999% Durability SLA",
        "specs": {
            "IOPS": "Up to 64,000 IOPS",
            "Throughput": "1,000 MiB/s Maximum",
            "Volume Size": "500 GiB Provisioned",
            "Multi-Attach": "Supported across EC2 instances",
        },
        "image": "/images/ebs.svg",
        "badge": "Extreme IOPS",
        "created_at": datetime(2026, 10, 24, 0, 0, 0, tzinfo=timezone.utc),
    },
    {
        "id": 11,
        "name": "Amazon CloudWatch Observability Suite",
        "category": "Observability",
        "description": (
            "Full-stack monitoring, distributed tracing with X-Ray, "
            "and real-time metric dashboards."
        ),
        "price": Decimal("29.99"),
        "stock": 75,
        "sla": "99.9% Availability SLA",
        "specs": {
            "Metrics": "1-Second High-Resolution",
            "Logs": "CloudWatch Logs Insights",
            "Tracing": "AWS X-Ray Distributed Traces",
            "Alerting": "Automated SNS Alarm Integration",
        },
        "image": "/images/cloudwatch.svg",
        "badge": "Telemetry",
        "created_at": datetime(2026, 10, 24, 0, 0, 0, tzinfo=timezone.utc),
    },
    {
        "id": 12,
        "name": "AWS Elastic Kubernetes Service (EKS) Node",
        "category": "Compute",
        "description": (
            "Enterprise-managed upstream Kubernetes worker pool with "
            "automated node group patching."
        ),
        "price": Decimal("95.00"),
        "stock": 30,
        "sla": "99.95% Cluster SLA",
        "specs": {
            "Nodes": "3x Managed Worker Instances",
            "CNI": "AWS VPC Native IP Allocation",
            "Ingress": "Integrated AWS ALB Ingress",
            "Autoscaler": "Karpenter Automated Provisioning",
        },
        "image": "/images/eks.svg",
        "badge": "Orchestrated",
        "created_at": datetime(2026, 10, 24, 0, 0, 0, tzinfo=timezone.utc),
    },
]


class ProductService:
    """Service providing catalog query operations with seed fallback."""

    @staticmethod
    async def get_products(
        session: Optional[AsyncSession],
        search: Optional[str] = None,
        category: Optional[str] = None,
        sort: Optional[str] = None,
        page: int = 1,
        limit: int = 12,
    ) -> ProductListResponse:
        """Fetch paginated products with search, category, and sorting filters.

        Args:
            session: Active database session or None.
            search: Optional text filter for name and description.
            category: Optional exact category filter.
            sort: Sort ordering ('price_asc', 'price_desc', 'name_asc', 'sla').
            page: 1-indexed page number.
            limit: Maximum items per page.

        Returns:
            ProductListResponse: Paginated products list and metadata.
        """
        # Ensure bounds
        page = max(1, page)
        limit = max(1, min(limit, 50))

        # Attempt querying database if session provided
        if session is not None:
            try:
                query = select(Product)
                count_query = select(func.count(Product.id))

                if search:
                    filter_clause = or_(
                        Product.name.ilike(f"%{search}%"),
                        Product.description.ilike(f"%{search}%"),
                    )
                    query = query.where(filter_clause)
                    count_query = count_query.where(filter_clause)

                if category and category.lower() != "all":
                    query = query.where(Product.category == category)
                    count_query = count_query.where(
                        Product.category == category
                    )

                # Sorting
                if sort == "price_asc":
                    query = query.order_by(Product.price.asc())
                elif sort == "price_desc":
                    query = query.order_by(Product.price.desc())
                elif sort == "name_asc":
                    query = query.order_by(Product.name.asc())
                elif sort == "sla":
                    query = query.order_by(Product.sla.desc())
                else:
                    query = query.order_by(Product.id.asc())

                total_res = await session.execute(count_query)
                total = total_res.scalar() or 0

                if total > 0:
                    offset = (page - 1) * limit
                    query = query.offset(offset).limit(limit)
                    items_res = await session.execute(query)
                    db_items = items_res.scalars().all()
                    total_pages = math.ceil(total / limit) if total > 0 else 0

                    return ProductListResponse(
                        items=[
                            ProductResponse.model_validate(p) for p in db_items
                        ],
                        total=total,
                        page=page,
                        limit=limit,
                        total_pages=total_pages,
                    )
            except Exception:
                # If database table is empty or error occurs, fall back to seed
                pass

        # Fallback in-memory catalog
        filtered = list(SEED_PRODUCTS)

        if search:
            s_lower = search.lower()
            filtered = [
                p
                for p in filtered
                if s_lower in p["name"].lower()
                or s_lower in p["description"].lower()
            ]

        if category and category.lower() != "all":
            cat_lower = category.lower()
            filtered = [
                p for p in filtered if p["category"].lower() == cat_lower
            ]

        if sort == "price_asc":
            filtered.sort(key=lambda p: p["price"])
        elif sort == "price_desc":
            filtered.sort(key=lambda p: p["price"], reverse=True)
        elif sort == "name_asc":
            filtered.sort(key=lambda p: p["name"])
        elif sort == "sla":
            filtered.sort(key=lambda p: p.get("sla", ""), reverse=True)
        else:
            filtered.sort(key=lambda p: p["id"])

        total = len(filtered)
        total_pages = math.ceil(total / limit) if total > 0 else 0
        start = (page - 1) * limit
        end = start + limit
        paginated_items = filtered[start:end]

        return ProductListResponse(
            items=[ProductResponse(**item) for item in paginated_items],
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
        )

    @staticmethod
    async def get_product_by_id(
        session: Optional[AsyncSession],
        product_id: int,
    ) -> Optional[ProductResponse]:
        """Fetch single product details by product ID.

        Args:
            session: Active database session or None.
            product_id: Primary key of product.

        Returns:
            Optional[ProductResponse]: Product entity if found, None otherwise.
        """
        if session is not None:
            try:
                result = await session.execute(
                    select(Product).where(Product.id == product_id)
                )
                db_product = result.scalar_one_or_none()
                if db_product is not None:
                    return ProductResponse.model_validate(db_product)
            except Exception:
                pass

        # Fallback to seed catalog
        for p in SEED_PRODUCTS:
            if p["id"] == product_id:
                return ProductResponse(**p)

        return None
