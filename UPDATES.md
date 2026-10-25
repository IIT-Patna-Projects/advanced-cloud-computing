# Updates
Log of user-visible features, behavioral changes, and fixes, ordered newest first.

### 2026-10-25 - Product Catalog API: List, Search, Filter, and Details (Done)
- Files modified: backend/app/models/product.py, backend/app/schemas/product.py, backend/app/services/product_service.py, backend/app/routers/products.py, backend/app/main.py, backend/tests/test_products.py
- Summary:
  - Implemented GET /products endpoint with keyword search, category filtering, price/name sorting, and pagination controls.
  - Implemented GET /products/{id} endpoint returning detailed specifications, SLA commitment, and stock availability.
  - Added SQLAlchemy 2.0 Product model with DECIMAL(10, 2) price precision and JSON hardware specifications.
  - Built resilient ProductService querying active MySQL session with deterministic in-memory seed catalog fallback.
  - Created comprehensive test suite verifying pagination boundaries, search query filtering, detail resolution, and 404 responses.
- Verification: 10 tests passed in pytest (0.64s), flake8 passed with 0 errors, 0 emoji violations.
- Issue: #13

### 2026-10-25 - Milestone M0: Comprehensive REST API Contract (Done)
- Files modified: docs/API.md, docs/README.md, AI.md
- Summary:
  - Formulated official REST API contract in docs/API.md establishing OpenAPI request and response schemas for all core services.
  - Specified endpoints for System Health, Customer Authentication (JWT), Catalog with pagination, Shopping Cart, ACID Orders, and Admin management.
  - Standardized JSON error response envelope across all HTTP status codes (400, 401, 403, 404, 409, 422, 500).
  - Defined explicit database row-locking protocol (SELECT ... FOR UPDATE) for concurrent checkout stock decrements under MySQL InnoDB.
  - Integrated initial draft from collaborator Garima Sharma with bilateral review and sign-off block.
- Verification: Re-read docs/API.md, verified schema consistency with frontend modules, 0 emoji violations.
- Issue: #6

### 2026-10-24 - Stage 4: Frontend Scaffolding, Multipage Storefront & GitHub Pages (Done)
- Files modified: frontend/public/*.html, frontend/public/js/*, .github/workflows/deploy-pages.yml, AI.md, README.md
- Summary:
  - Built comprehensive 7-page e-commerce storefront (Catalog, Product Details, Cart, Checkout, Order History, Login, Registration).
  - Added GitHub Actions workflow deploying frontend to GitHub Pages automatically on push to main.
  - Implemented client modules for catalog search/filtering, cart management, simulated ACID checkout, and order history.
  - Added AI collaboration log in AI.md tracking proposals and architectural recommendations.
  - Enforced zero emojis repository-wide, using clean SVG icons and official technology badges.
- Verification: npm run lint passed with 0 errors, build:css compiled in 888ms, all 7 pages verified.
- Issue: #4

### 2026-10-24 - Stage 2: Backend Core (FastAPI) (Done)
- Files modified: backend/app/main.py, backend/app/routers/health.py, backend/app/config.py, backend/app/database.py, backend/app/schemas/health.py
- Summary:
  - Added GET /health endpoint reporting operational readiness and MySQL database connectivity.
  - Enabled interactive OpenAPI documentation and Swagger UI at /docs and /redoc.
  - Configured Pydantic settings loading and async SQLAlchemy database connectivity probe.
- Verification: 2 tests passed in pytest, flake8 passed with 0 errors, HTTP 200 verified on /health and /docs.
- Issue: #5

## 2026-10-24
### Added
- Enabled interactive OpenAPI documentation and Swagger UI at /docs and /redoc. (#5)
- Added GET /health endpoint reporting operational readiness and MySQL database connectivity. (#5)
- Initialized ShopScale repository skeleton, architecture documentation, configuration templates, and contributor rules. (#1)
