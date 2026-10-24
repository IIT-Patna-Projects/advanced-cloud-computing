# Commit log
Chronological record of every commit made to the repository, ordered newest first.

### 2026-10-24 22:38 (IST) | feat: initialize models package
- Author: PriyanshuKSharma
- Issue: #5
- Branch: 5-feat-scaffold-fastapi-backend
- Files changed: backend/app/models/__init__.py
- What and why: Export declarative Base for database models.
- How it was verified: Verified model importability in python shell.

### 2026-10-24 22:38 (IST) | feat: configure async sqlalchemy engine and database connectivity probe
- Author: PriyanshuKSharma
- Issue: #5
- Branch: 5-feat-scaffold-fastapi-backend
- Files changed: backend/app/database.py
- What and why: Establish async SQLAlchemy 2.0 engine using aiomysql driver, session generator, and async connection check.
- How it was verified: Tested async connection probe handling disconnected state gracefully.

### 2026-10-24 22:37 (IST) | feat: implement backend settings configuration with pydantic-settings
- Author: PriyanshuKSharma
- Issue: #5
- Branch: 5-feat-scaffold-fastapi-backend
- Files changed: backend/app/config.py
- What and why: Provide type-safe settings loaded from environment variables and .env with development defaults.
- How it was verified: Tested configuration instantiation and default parameter retrieval.

### 2026-10-24 22:37 (IST) | feat: initialize backend app package
- Author: PriyanshuKSharma
- Issue: #5
- Branch: 5-feat-scaffold-fastapi-backend
- Files changed: backend/app/__init__.py
- What and why: Establish Python package boundary for FastAPI application.
- How it was verified: Verified package importability.

### 2026-10-24 22:36 (IST) | chore: add backend development dependencies in requirements-dev.txt
- Author: PriyanshuKSharma
- Issue: #5
- Branch: 5-feat-scaffold-fastapi-backend
- Files changed: backend/requirements-dev.txt
- What and why: Declare development and testing tools including pytest, pytest-asyncio, httpx, and flake8.
- How it was verified: Ran flake8 and pytest locally.

### 2026-10-24 22:36 (IST) | chore: add backend production dependencies in requirements.txt
- Author: PriyanshuKSharma
- Issue: #5
- Branch: 5-feat-scaffold-fastapi-backend
- Files changed: backend/requirements.txt
- What and why: Declare production dependencies including FastAPI, Uvicorn, Pydantic, SQLAlchemy, aiomysql, and PyMySQL.
- How it was verified: Verified pip installation and dependency resolution.

### 2026-10-24 22:35 (IST) | chore: remove backend placeholder gitkeep files
- Author: PriyanshuKSharma
- Issue: #5
- Branch: 5-feat-scaffold-fastapi-backend
- Files changed: backend/app/.gitkeep, backend/tests/.gitkeep
- What and why: Remove placeholder .gitkeep files as backend app and test packages are populated.
- How it was verified: Verified removal with git status and tree check.

### 2026-10-24 20:14 (IST) | chore: initialize repository skeleton, configuration, and documentation
- Author: PriyanshuKSharma
- Issue: #1
- Branch: 1-chore-create-repo-readme-gitignore-envexample
- Files changed: .gitignore, .env.example, README.md, CONTRIBUTING.md, COMMITS.md, UPDATES.md, .github/ISSUE_TEMPLATE/*, docs/*, monitoring/*, infrastructure/*
- What and why: Establish foundational monorepo structure, documentation, environment template, and git rules for ShopScale.
- How it was verified: Verified tree layout, git status, and tested .gitignore against .env.
