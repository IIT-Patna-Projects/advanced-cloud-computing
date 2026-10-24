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

---

## 2. Milestone and Issue Execution History

| Date | Issue | Component | AI Proposal & Implementation Summary | Status |
|---|---|---|---|---|
| 2026-10-24 | #1 | Repository / Docs | Established monorepo directory layout, `.env.example`, `.gitignore`, `CONTRIBUTING.md`, `AGENTS.md`, and record-keeping protocols. | Merged (PR #57) |
| 2026-10-24 | #5 | Backend Core | Scaffolded FastAPI app, Pydantic Settings configuration, SQLAlchemy 2.0 async engine, `/health` endpoint, `/docs` Swagger UI, and pytest test suite. | Merged (PR #59) |
| 2026-10-24 | #4 | Frontend Core | Scaffolding Express server, Tailwind v3 CLI pipeline, `/healthz` endpoint, `/api/*` reverse proxy, and vanilla JS client modules (`api.js`, `auth.js`, `cart.js`). | In Progress |
