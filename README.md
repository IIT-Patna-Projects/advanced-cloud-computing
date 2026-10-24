# ShopScale

ShopScale is a decoupled e-commerce web application engineered to benchmark cloud auto-scaling, containerization, and reliability patterns on AWS under synthetic load.

---

## Architecture Overview

ShopScale implements a three-tier decoupled architecture:

```
[ Browser Client ]
       |
       | HTTP (Port 3000)
       v
[ Express.js Frontend Server ]
       | - Serves static HTML/JS/CSS
       | - Proxies /api/* requests
       |
       | HTTP (Port 8000)
       v
[ FastAPI Backend ]
       | - REST API & Authentication (JWT)
       | - Business logic & validation
       |
       | TCP (Port 3306)
       v
[ MySQL 8.0 Database (InnoDB) ]
         - ACID row locks on checkout (SELECT ... FOR UPDATE)
```

- **Frontend**: Plain HTML5 and Vanilla JavaScript (native ES modules, zero runtime UI framework) styled with Tailwind CSS via the standalone Tailwind CLI.
- **Frontend Server**: Node.js + Express.js serving `frontend/public/` and proxying `/api/*` to the backend.
- **Backend**: Python 3.11+ with FastAPI, Pydantic v2 schemas, and async SQLAlchemy 2.0 with `aiomysql`.
- **Database**: MySQL 8.0 with InnoDB engine, managed via Alembic schema migrations.
- **Testing**: Pytest (backend unit/API), Playwright (browser journey tests), and Locust (load generation).
- **Orchestration**: Docker Compose and multi-stage Dockerfiles.

---

## Directory Structure

```
shopscale/
|-- backend/              # FastAPI application, SQLAlchemy models, schemas, routers, tests
|-- frontend/             # Express server, Tailwind input, public HTML/JS/CSS assets
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
|-- COMMITS.md            # Commit log (Rule 8a)
|-- UPDATES.md            # User-visible update log (Rule 8b)
|-- CONTRIBUTING.md       # Contribution guidelines and workflow rules
`-- plan.md               # Master engineering blueprint
```

---

## Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 20.x or higher with `npm`
- **Docker**: Docker Engine 24+ and Docker Compose v2+
- **MySQL**: 8.0 (run locally or via Docker Compose)

---

## Local Setup

### 1. Clone & Configure Environment

```bash
git clone https://github.com/IIT-Patna-Projects/advanced-cloud-computing.git
cd advanced-cloud-computing
cp .env.example .env
```

### 2. Backend Setup

```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

### 3. Frontend Setup

```bash
npm --prefix frontend install
npm --prefix frontend run build:css
```

---

## Running the Services

### Development Mode

1. **Start MySQL Database**:
   ```bash
   docker compose up -d db
   ```

2. **Run Migrations & Seed**:
   ```bash
   alembic -c database/alembic.ini upgrade head
   python database/seed.py
   ```

3. **Start FastAPI Backend**:
   ```bash
   uvicorn app.main:app --app-dir backend --reload --port 8000
   ```

4. **Start Frontend Server (with Tailwind Watch)**:
   ```bash
   # Terminal 1: Watch Tailwind CSS changes
   npm --prefix frontend run watch:css

   # Terminal 2: Run Express server
   npm --prefix frontend start
   ```

Access the application in your browser at `http://localhost:3000`. Backend OpenAPI interactive documentation is available at `http://localhost:8000/docs`.

---

## Test & Quality Gates

Run all automated checks prior to opening pull requests:

```bash
# Backend unit & integration tests
pytest backend/tests

# Backend linting
flake8 backend/app

# Frontend linting
npm --prefix frontend run lint

# End-to-end browser smoke tests
npx --prefix browser-tests playwright test

# Load test simulation (local synthetic traffic)
locust -f load-tests/locustfile.py --headless -u 10 -r 2 -t 30s --host http://localhost:3000
```

---

## Collaboration & Contributing

Please consult [AGENTS.md](AGENTS.md) for strict repository rules, commit protocols, and multi-contributor protection guidelines. Refer to [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming and pull request workflows.
