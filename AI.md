# AI Collaboration & Proposal Log

This document records all AI architectural proposals, design recommendations, and implementation decisions adopted in the ShopScale repository.

---

## 1. Architectural Proposals and Decisions

### Async Database Layer (ADR 0001)
- **AI Proposal**: Migrate from blocking synchronous database drivers to asynchronous SQLAlchemy 2.0 with `aiomysql` (`mysql+aiomysql://`) for all FastAPI runtime query execution.
- **Rationale**: Under synthetic load testing (Locust), synchronous drivers saturate the Python event loop thread during I/O wait, causing throughput bottlenecks. Async drivers allow the single worker process to handle concurrent requests efficiently.
- **Adopted**: Yes. Configured in `backend/app/database.py` with `pool_pre_ping=True`.

### Unified Reverse Proxy Topology
- **AI Proposal**: Implement an Express reverse-proxy at `http://localhost:3000` forwarding `/api/*` to the FastAPI backend at `http://localhost:8000`.
- **Rationale**: Browser clients never communicate directly with the backend port. This eliminates CORS overhead, simplifies cookie and security header management, and provides a single origin entrypoint for CDN/ALB routing.
- **Adopted**: Yes. Configured in `frontend/server.js` using `http-proxy-middleware`.

### Non-blocking Health Check with Defensive Probe
- **AI Proposal**: Implement `check_database_connection()` with a defensive 2-second timeout and try/except block.
- **Rationale**: If the database container is starting up or temporarily unreachable, the `/health` endpoint must not hang or fail container orchestrator health checks. It reports `"database": "disconnected"` while maintaining HTTP 200 operational readiness.
- **Adopted**: Yes. Implemented in `backend/app/database.py` and `backend/app/routers/health.py`.

### Pure Vanilla JavaScript & Tailwind CLI Architecture
- **AI Proposal**: Standardize frontend development on native ES modules and standalone Tailwind CLI v3 compilation, avoiding heavyweight client-side runtime frameworks (React, Vue, Angular).
- **Rationale**: Minimizes asset payload sizes for cloud auto-scaling experiments, guarantees predictable bundle sizes, and eliminates framework hydration overhead.
- **Adopted**: Yes. Configured with native ES modules and standalone Tailwind CLI scripts.

### Zero Emojis and Vector Iconography Standard
- **AI Proposal**: Prohibit emojis across all documentation, source code, UI templates, and commit messages. Rely exclusively on official technology logos, SVG vector icons, and shields.io status badges.
- **Rationale**: Enforces consistent enterprise engineering aesthetics across academic and industry presentations.
- **Adopted**: Yes. Repository-wide standard enforced.

### Multipage E-Commerce Storefront Architecture
- **AI Proposal**: Implement a comprehensive 7-page e-commerce architecture (`index.html`, `product.html`, `cart.html`, `checkout.html`, `orders.html`, `login.html`, `register.html`) with modular client ES scripts, real-time catalog search/filtering, cart state persistence in localStorage, and simulated checkout flows.
- **Rationale**: Provides a realistic commercial application footprint for benchmarking cloud auto-scaling, containerization, and static asset offloading on AWS and GitHub Pages.
- **Adopted**: Yes. Implemented in `frontend/public/` using Tailwind CSS and native ES modules.

### Automated GitHub Pages Hosting Pipeline
- **AI Proposal**: Configure a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) triggered on push to `main` that compiles Tailwind CSS assets and deploys `frontend/public` as an interactive static website.
- **Rationale**: Enables zero-friction online previewing of the storefront for academic review and stakeholder demonstrations without manual server provisioning.
- **Adopted**: Yes. Configured in `.github/workflows/deploy-pages.yml`.

### Unified REST API Contract & Concurrency Model
- **AI Proposal**: Standardize all API contracts in `docs/API.md` with uniform JSON error envelopes (`{ "error", "code", "status", "details" }`), strict HTTP status mapping, paginated catalog queries, and explicit ACID transactions using `SELECT ... FOR UPDATE` row locks for order checkout.
- **Rationale**: Prevents race conditions and inventory overselling during concurrent load surges on AWS, aligns frontend proxy endpoints with FastAPI routers, and ensures deterministic error handling across all client modules.
- **Adopted**: Yes. Integrated into `docs/API.md` incorporating teammate Garima's initial outline.

### Decoupled Parallel CI Pipeline Architecture
- **AI Proposal**: Implement dual parallel GitHub Actions jobs (`backend` and `frontend`) in `.github/workflows/ci.yml` with dependency caching (`pip` and `npm`) and cancel-in-progress concurrency groups.
- **Rationale**: Prevents frontend style changes from blocking backend test cycles, ensures fail-fast feedback on pull requests, and validates that neither service's dependencies or linters regress.
- **Adopted**: Yes. Configured in `.github/workflows/ci.yml`.

### Resilient Catalog Service with In-Memory Seed Fallback
- **AI Proposal**: Implement `ProductService` to query MySQL 8.0 via SQLAlchemy 2.0 with dynamic SQL filters (`ilike` text search, category equality, order_by, and offset/limit pagination), with automatic fallback to an in-memory seed catalog if the database table is unpopulated or unreachable.
- **Rationale**: Eliminates hard dependency on external MySQL containers during local unit test suites (`pytest`) and early developer workflows while ensuring exact schema and contract parity with the database model.
- **Adopted**: Yes. Implemented in `backend/app/services/product_service.py` and `backend/app/routers/products.py`.

### Frontend Live API Integration with Skeletons and Offline Resilience
- **AI Proposal**: Connect `index.js` and `product.js` to the live Express proxy (`/api/products` and `/api/products/{id}`) with animated loading skeletons, debounced search (250ms), AbortController request cancellation, and automatic fallback to client-side catalog data if the API is unreachable.
- **Rationale**: Provides smooth perceived performance with zero layout shift during asynchronous data fetching, protects the backend against search input query flooding, and guarantees full offline usability for GitHub Pages static deployments.
- **Adopted**: Yes. Implemented in `frontend/public/js/index.js` and `frontend/public/js/product.js`.

---

## 2. Milestone and Issue Execution History

| Date | Issue | Component | AI Proposal & Implementation Summary | Status |
|---|---|---|---|---|
| 2026-10-24 | #1 | Repository / Docs | Established monorepo directory layout, `.env.example`, `.gitignore`, `CONTRIBUTING.md`, `AGENTS.md`, and record-keeping protocols. | Merged (PR #57) |
| 2026-10-24 | #5 | Backend Core | Scaffolded FastAPI app, Pydantic Settings configuration, SQLAlchemy 2.0 async engine, `/health` endpoint, `/docs` Swagger UI, and pytest test suite. | Merged (PR #59) |
| 2026-10-24 | #4 | Frontend Core | Built multipage e-commerce storefront (7 pages), Express reverse proxy, Tailwind v3 pipeline, client modules, and GitHub Pages CI/CD workflow. | Merged (PR #60) |
| 2026-10-25 | #6 | Architecture / Docs | Drafted comprehensive REST API contract in `docs/API.md` with standardized error schemas, catalog pagination, cart lifecycle, and ACID checkout row-locking. | Merged (PR #63) |
| 2026-10-25 | #7 | CI/CD Automation | Created parallel GitHub Actions CI workflow in `.github/workflows/ci.yml` executing backend tests/lint and frontend build/lint. | Completed |
| 2026-10-25 | #13 | Backend / Products | Built GET /products and GET /products/{id} with filtering, sorting, pagination, SQLAlchemy model, and test suite. | Completed |
| 2026-10-26 | #14 | Frontend / Products | Connected catalog and detail pages to live API with animated loading skeletons, debounced search, error banners, and offline fallback. | Completed |
