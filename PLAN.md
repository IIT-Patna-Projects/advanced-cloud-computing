 	

# ShopScale - Architecture & Implementation Plan

ShopScale is a lightweight, production-grade e-commerce application designed to study cloud scaling, load testing, and reliability patterns on AWS.

---

## 1. Project Overview & Specifications

- **Name**: `shopscale`
- **Purpose**: A small e-commerce web application used to evaluate cloud auto-scaling, containerization, resilience patterns, and load testing on AWS.
- **Core User Journeys**:
  - Browse and search product catalog
  - User registration and authentication (JWT)
  - Persistent shopping cart
  - Simulated atomic checkout (with stock decrement under transactions)
  - User order history
  - Basic administrator product management (create, update stock/price)
- **Frontend**: Plain HTML5 + Vanilla JavaScript (native ES modules, no framework runtime) styled with Tailwind CSS (built using standalone Tailwind CLI).
- **Frontend Server**: Node.js + Express.js. Serves static assets from `frontend/public/` and reverse-proxies `/api/*` to the FastAPI backend.
- **Backend**: Python 3.11+ with FastAPI.
- **Database**: MySQL 8.0, managed via SQLAlchemy 2.0 (Async with `aiomysql`) and Alembic migrations.
- **Testing**:
  - Unit/Integration: `pytest` with `pytest-asyncio` and `httpx`
  - End-to-end / Browser journeys: `Playwright`
  - Load & Concurrency: `Locust`
- **Containers**: Multi-stage Dockerfiles and Docker Compose.
- **Repository Strategy**: GitHub Monorepo, trunk-based development with short-lived feature branches (`feat/`, `fix/`, `chore/`).

---

## 2. Architecture & Technology Stack

```
                   +---------------------------+
                   |       User Browser        |
                   +-------------+-------------+
                                 |
                                 | HTTP (:3000)
                                 v
               +-----------------------------------+
               |     Node.js + Express Server      |
               | - Serves static HTML/JS/CSS       |
               | - Security headers & error mask   |
               | - Health endpoint (/healthz)      |
               | - Reverse proxy: /api/* --------+ |
               +---------------------------------|-+
                                                 |
                               | Proxy HTTP (:8000)
                               v
               +-----------------------------------+
               |        FastAPI Backend App        |
               | - App routers & auth dependencies |
               | - Pydantic request/response v2    |
               | - Health endpoint (/health)       |
               | - SQLAlchemy 2.0 (Async aiomysql) |
               +-----------------+-----------------+
                                 |
                                 | Async TCP (:3306)
                                 v
               +-----------------------------------+
               |          MySQL 8.0 Database       |
               | - ACID Transactions (InnoDB)      |
               | - Row locking (SELECT FOR UPDATE) |
               | - Alembic migrations              |
               +-----------------------------------+
```

### Architectural Decisions

1. **Database Dialect & Driver**:
   - Runtime: `mysql+aiomysql://` for non-blocking asynchronous queries in FastAPI endpoints.
   - Migration: Alembic configured with `pymysql` / `aiomysql`.
   - String indexing: All indexed VARCHAR columns must declare explicit lengths (e.g., `VARCHAR(255)`) to comply with MySQL InnoDB 767/3072-byte key limits.
   - Currency: Stored as `DECIMAL(10, 2)` to eliminate floating-point arithmetic errors.
2. **Reverse Proxy Strategy**:
   - The browser communicates solely with Express at `http://localhost:3000`.
   - Express transparently proxies `/api/*` to `BACKEND_URL` (default `http://localhost:8000`), stripping CORS complexity and providing a single unified origin for cookies/headers.
3. **Authentication & Authorization**:
   - Stateless JWT tokens (algorithm HS256) returned in response payloads and stored in `sessionStorage`/memory.
   - Forwarded via standard `Authorization: Bearer <token>` headers through the Express proxy.
   - Server-side role checks for admin operations (`is_admin=True`).
4. **Checkout Concurrency**:
   - Stock deduction executes inside an isolated database transaction with row-level locks (`SELECT ... FOR UPDATE`) to prevent overselling during high-concurrency Locust load tests.

---

## 3. Directory Layout

```
shopscale/
|-- .github/
|   |-- workflows/
|   |   `-- ci.yml
|   `-- ISSUE_TEMPLATE/
|       |-- bug_report.md
|       `-- feature_request.md
|-- backend/
|   |-- app/
|   |   |-- __init__.py
|   |   |-- main.py
|   |   |-- config.py
|   |   |-- database.py
|   |   |-- models/
|   |   |   |-- __init__.py
|   |   |   |-- user.py
|   |   |   |-- product.py
|   |   |   `-- order.py
|   |   |-- schemas/
|   |   |   |-- __init__.py
|   |   |   |-- user.py
|   |   |   |-- product.py
|   |   |   `-- order.py
|   |   |-- services/
|   |   |   |-- __init__.py
|   |   |   |-- auth.py
|   |   |   `-- order.py
|   |   `-- routers/
|   |       |-- __init__.py
|   |       |-- auth.py
|   |       |-- products.py
|   |       |-- orders.py
|   |       `-- health.py
|   |-- tests/
|   |   |-- __init__.py
|   |   |-- conftest.py
|   |   `-- test_health.py
|   |-- requirements.txt
|   |-- requirements-dev.txt
|   `-- Dockerfile
|-- frontend/
|   |-- public/
|   |   |-- index.html
|   |   |-- product.html
|   |   |-- cart.html
|   |   |-- checkout.html
|   |   |-- orders.html
|   |   |-- login.html
|   |   |-- register.html
|   |   |-- css/
|   |   |   `-- styles.css (generated by Tailwind CLI)
|   |   `-- js/
|   |       |-- api.js
|   |       |-- auth.js
|   |       |-- cart.js
|   |       |-- index.js
|   |       |-- product.js
|   |       |-- checkout.js
|   |       `-- orders.js
|   |-- src/
|   |   `-- input.css
|   |-- server.js
|   |-- package.json
|   |-- tailwind.config.js
|   `-- Dockerfile
|-- database/
|   |-- alembic/
|   |   |-- versions/
|   |   |-- env.py
|   |   `-- script.py.mako
|   |-- alembic.ini
|   `-- seed.py
|-- browser-tests/
|   |-- package.json
|   `-- tests/
|       `-- smoke.spec.js
|-- load-tests/
|   |-- locustfile.py
|   `-- requirements.txt
|-- monitoring/
|   `-- README.md
|-- infrastructure/
|   `-- README.md
|-- docs/
|   |-- architecture.md
|   `-- decisions/
|       `-- 0001-use-mysql-and-asyncpg.md
|-- .env.example
|-- .gitignore
|-- CONTRIBUTING.md
|-- docker-compose.yml
|-- plan.md
`-- README.md
```

---

## 4. Engineering & Safety Guidelines

- **Zero Secrets in Git**: All credentials (database passwords, JWT secret keys, service ports) must load from environment variables with safe defaults in `.env.example`.
- **Input Validation & Sanitization**: FastAPI Pydantic models validate all request payloads. Vanilla JavaScript handles dynamic data strictly via `element.textContent` or safe DOM builders to eliminate Cross-Site Scripting (XSS).
- **Transactional Integrity**: Every state change affecting product stock or order records executes within an explicit database transaction with row locks.
- **Safety during Load Testing**:
  - Target exclusively the local/isolated test cluster.
  - Capped maximum concurrency and fixed duration.
  - Simulated payment processing only; explicit UI banner denoting simulated transaction environment.

---

## 5. Staged Implementation Roadmap

### Stage 1: Skeleton

- **Deliverables**: Directory layout, root `.gitignore`, `.env.example` (MySQL connection variables and app secrets), `README.md`, and `CONTRIBUTING.md`.
- **Verification**: Directory tree inspection and clean Git status.

### Stage 2: Backend Core (FastAPI)

- **Deliverables**: FastAPI app setup, configuration loading from `.env`, project structure (`routers`, `models`, `schemas`, `services`), working `/health` endpoint returning database readiness and system metadata, and interactive OpenAPI documentation at `/docs`.
- **Verification**: `curl http://localhost:8000/health` returns status code 200 with JSON payload; Swagger UI loads at `http://localhost:8000/docs`.

### Stage 3: Database & Migrations (MySQL 8.0)

- **Deliverables**: SQLAlchemy 2.0 models (`users`, `products`, `orders`, `order_items`), Alembic setup configured for MySQL async/sync connections, initial migration script creating all tables and indexes, deterministic seed script (`database/seed.py`), and a standalone Docker Compose definition for MySQL.
- **Verification**: Run MySQL via Docker, execute `alembic upgrade head`, run `python database/seed.py`, verify populated tables with MySQL client.

### Stage 4: Frontend (Express & Tailwind)

- **Deliverables**:
  - Express server (`frontend/server.js`) serving static files, reverse-proxying `/api/*` to `BACKEND_URL`, exposing `/healthz`, adding standard security headers, and suppressing stack traces in responses.
  - Tailwind v3 CLI setup (`tailwind.config.js`, `src/input.css`) with npm scripts `build:css` and `watch:css`.
  - Vanilla JS modular components (`api.js`, `auth.js`, `cart.js`) and UI pages:
    - Product list (`index.html`) with search and category filter
    - Product detail page (`product.html`)
    - Login & registration pages (`login.html`, `register.html`)
    - Shopping cart page (`cart.html`)
    - Simulated checkout page (`checkout.html`)
    - Order history page (`orders.html`)
- **Verification**: Start Express server, compile Tailwind CSS, navigate to `http://localhost:3000/healthz` and `http://localhost:3000/`, browse products, and check proxy requests in network console.

### Stage 5: Tests & Continuous Integration

- **Deliverables**:
  - Backend unit & API tests with `pytest` (e.g., testing `/health`, registration, and inventory check).
  - Playwright browser smoke test (`browser-tests/`) verifying product navigation and simulated cart addition.
  - Locust load testing script (`load-tests/locustfile.py`) with user browsing and checkout tasks.
  - GitHub Actions CI workflow (`.github/workflows/ci.yml`) running distinct parallel jobs for `backend` and `frontend`.
- **Verification**: `pytest` passes locally; `npm test` in `frontend` passes; Playwright smoke test passes against local servers.

### Stage 6: Dockerization & Orchestration

- **Deliverables**:
  - Multi-stage Dockerfile for `frontend` (Stage 1 compiles Tailwind CSS; Stage 2 runs minimal Node production image).
  - Production-ready Dockerfile for `backend`.
  - Root `docker-compose.yml` linking `db` (MySQL 8.0), `backend` (FastAPI), and `frontend` (Express).
- **Verification**: `docker compose up --build` boots the entire stack from scratch; all health checks pass; full customer flow works end-to-end on `http://localhost:3000`.
