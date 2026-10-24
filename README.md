# ShopScale

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-5FA04E?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Engine_24+-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-Cloud_Target-232F3E?style=flat&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Pytest](https://img.shields.io/badge/Pytest-Automated_Tests-0A9EDC?style=flat&logo=pytest&logoColor=white)](https://docs.pytest.org/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E_Tests-2EAD33?style=flat&logo=playwright&logoColor=white)](https://playwright.dev/)
[![Locust](https://img.shields.io/badge/Locust-Load_Testing-1389FD?style=flat&logo=locust&logoColor=white)](https://locust.io/)

ShopScale is a decoupled e-commerce web application engineered to benchmark cloud auto-scaling, containerization, and reliability patterns on AWS under synthetic load.

---

## Architecture Topology

```
+-------------------------------------------------------------------+
|                        Client Web Browser                         |
+---------------------------------+---------------------------------+
                                  |
                                  | HTTP (:3000)
                                  v
+-------------------------------------------------------------------+
|                      Express Frontend Server                      |
| - Serves static HTML, JavaScript (ES modules), and CSS assets    |
| - Security headers (X-Content-Type-Options, X-Frame-Options)      |
| - Frontend health endpoint: GET /healthz                          |
| - Reverse proxy: /api/* ----------------------------------------+ |
+-----------------------------------------------------------------|-+
                                                                  |
                                                Proxy HTTP (:8000)|
                                                                  v
+-------------------------------------------------------------------+
|                        FastAPI Backend App                        |
| - REST API routers with Pydantic request/response validation      |
| - Interactive OpenAPI documentation at /docs and /redoc           |
| - Backend health check & readiness endpoint: GET /health          |
| - Async SQLAlchemy 2.0 with aiomysql driver connection pool       |
+---------------------------------+---------------------------------+
                                  |
                                  | Async TCP (:3306)
                                  v
+-------------------------------------------------------------------+
|                        MySQL 8.0 Database                         |
| - InnoDB transactional storage engine                             |
| - ACID row-level locking (SELECT ... FOR UPDATE) on checkout      |
| - Schema migrations managed via Alembic                           |
+-------------------------------------------------------------------+
```

---

## Directory Structure

```
shopscale/
|-- backend/              # FastAPI application, SQLAlchemy models, schemas, routers, tests
|   |-- app/              # Core application package (config, database, models, routers, schemas)
|   `-- tests/            # Automated pytest unit and integration test suite
|-- frontend/             # Express server, Tailwind input, public HTML/JS/CSS assets
|   |-- public/           # Static HTML pages, ES module scripts, compiled styles
|   |-- src/              # Tailwind CSS input source
|   `-- server.js         # Express reverse proxy and asset server
|-- database/             # Alembic migration scripts and deterministic seed script
|-- browser-tests/        # Playwright end-to-end browser journey suites
|-- load-tests/           # Locust load simulation scenarios
|-- monitoring/           # CloudWatch metrics, alarms, and dashboard templates
|-- infrastructure/       # AWS cloud manifests and Terraform/CDK templates
|-- docs/                 # Architectural documentation and Decision Records (ADRs)
|-- .github/              # GitHub Actions workflows and issue templates
|-- .env.example          # Environment variable template with safe defaults
|-- .gitignore            # Git ignore specification
|-- AGENTS.md             # Multi-contributor rules and execution protocols
|-- AI.md                 # AI architectural proposals and collaboration log
|-- COMMITS.md            # Commit log (Rule 8a)
|-- UPDATES.md            # User-visible update log (Rule 8b)
|-- CONTRIBUTING.md       # Contribution guidelines and workflow rules
`-- PLAN.md               # Master engineering blueprint
```

---

## Interactive Step-by-Step Guide

<details>
<summary><b>1. System Prerequisites</b></summary>

Ensure the following runtimes are installed on your workstation:
- **Python**: Version 3.11 or higher
- **Node.js**: Version 20.x or higher with `npm`
- **Docker**: Docker Engine 24+ and Docker Compose v2+
- **MySQL**: Version 8.0 (local daemon or Docker container)

Verify runtime versions:
```bash
python --version
node --version
npm --version
docker --version
```
</details>

<details>
<summary><b>2. Environment Configuration</b></summary>

Copy the configuration template to `.env`:
```bash
cp .env.example .env
```

Key environment variables:
| Variable | Default Value | Description |
|---|---|---|
| `APP_ENV` | `development` | Deployment environment name |
| `DEBUG` | `true` | Enables verbose logging and CORS in development |
| `BACKEND_PORT` | `8000` | Port for the FastAPI backend service |
| `PORT` | `3000` | Port for the Express frontend service |
| `DATABASE_URL` | `mysql+aiomysql://...` | Asynchronous DSN for FastAPI runtime queries |
| `DATABASE_URL_SYNC` | `mysql+pymysql://...` | Synchronous DSN for Alembic migrations |
| `BACKEND_URL` | `http://localhost:8000` | Target URL for Express `/api/*` reverse proxy |

</details>

<details>
<summary><b>3. Backend Installation and Execution</b></summary>

Install Python dependencies:
```bash
pip install -r backend/requirements.txt -r backend/requirements-dev.txt
```

Run FastAPI in development reload mode:
```bash
uvicorn app.main:app --app-dir backend --reload --port 8000
```

Verify backend health:
```bash
curl http://localhost:8000/health
```

Access interactive documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

</details>

<details>
<summary><b>4. Frontend Installation and Execution</b></summary>

Install Node.js dependencies:
```bash
npm --prefix frontend install
```

Compile Tailwind CSS assets:
```bash
npm --prefix frontend run build:css
```

Start the Express frontend server:
```bash
npm --prefix frontend start
```

For active frontend development with Tailwind live watcher:
```bash
# Terminal 1: Live Tailwind compiler
npm --prefix frontend run watch:css

# Terminal 2: Express server
npm --prefix frontend start
```

Access frontend application:
- Storefront UI: `http://localhost:3000/`
- Frontend health check: `http://localhost:3000/healthz`

</details>

<details>
<summary><b>5. Database Provisioning and Migrations</b></summary>

Start local MySQL 8.0 instance via Docker Compose:
```bash
docker compose up -d db
```

Execute schema migrations:
```bash
alembic -c database/alembic.ini upgrade head
```

Populate deterministic seed catalog:
```bash
python database/seed.py
```

</details>

---

## API & Service Endpoints

### Frontend Service (`http://localhost:3000`)
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Responsive storefront homepage and catalog view |
| `GET` | `/healthz` | Express server operational readiness check |
| `ALL` | `/api/*` | Reverse-proxied to backend service (`http://localhost:8000/*`) |

### Backend Service (`http://localhost:8000`)
| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | System metadata and MySQL connectivity probe |
| `GET` | `/docs` | Interactive Swagger UI API documentation |
| `GET` | `/redoc` | ReDoc API specification viewer |
| `GET` | `/openapi.json` | OpenAPI 3.1 machine-readable specification |

---

## Quality Gates and Verification

Execute the following quality checks prior to opening pull requests:

```bash
# 1. Backend test suite
pytest backend/tests

# 2. Backend PEP8 compliance
flake8 backend/app backend/tests

# 3. Frontend code quality
npm --prefix frontend run lint

# 4. Frontend CSS compilation
npm --prefix frontend run build:css

# 5. End-to-end browser smoke test
npx --prefix browser-tests playwright test

# 6. Concurrency and synthetic load test
locust -f load-tests/locustfile.py --headless -u 10 -r 2 -t 30s --host http://localhost:3000
```

---

## Governance and AI Collaboration

- Refer to [AGENTS.md](AGENTS.md) for repository rules, commit protocols, and multi-contributor guidelines.
- Refer to [AI.md](AI.md) for architectural proposals, design rationales, and AI collaboration tracking.
- Refer to [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming conventions and quality checklists.
