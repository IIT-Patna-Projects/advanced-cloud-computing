# Updates
Log of user-visible features, behavioral changes, and fixes, ordered newest first.

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
