# AGENTS.md

## 1. Project rules (do not edit without user approval)
- Never break, remove, or silently change code that other contributors own or depend on.
- Make no file changes before the user approves a plan. State the plan first: files to touch, why, and what could break.
- Execute one task or milestone per session. Stop and wait for user approval before starting the next.
- Keep public contracts strictly backward compatible: API routes, response shapes, database schemas, environment variable names, function signatures, shared CSS classes, and element IDs.
- Obtain explicit user approval and define a deprecation path before proposing any breaking change.
- Commit each modified file separately, using a descriptive `type: summary` message for each commit.
- Log every commit to `COMMITS.md` and every user-visible change to `UPDATES.md` following Section 3.

## 2. Collaboration and shared-code protection
- Run `git fetch` and `git pull --rebase` at the start of every task, then re-read all Markdown files in the repository (`AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `COMMITS.md`, `UPDATES.md`, everything in `docs/` and `docs/decisions/`, and any `AGENTS.md` inside subfolders), because other contributors may have updated rules, logs, or documentation since your last session.
- Read the newest entries in `COMMITS.md` and `UPDATES.md` first to see what changed recently and which files it touched; summarize anything relevant to the task in the plan before asking for approval.
- Read every Markdown file in the repository before making any change to check for new rules, recent changes, open decisions, and instructions that affect the task; if they conflict with each other or with the task, stop and tell the user before changing anything.
- Run `git status` and check open branches and PRs for changes to the same files; stop and notify the user immediately if overlap exists.
- Touch only files strictly required for the assigned task. Never reformat, rename, move, or reorganize untouched files.
- Never edit code belonging to another owner (defined in `.github/CODEOWNERS`) without explicitly noting it in the plan and tagging them for review.
- Prefer additive changes: add new files, new functions, optional parameters, and feature flags rather than modifying working behavior.
- Search the entire repository for every caller before changing any shared function, route, schema, config, or component, and list all callers in the plan.
- Keep edits to shared files (`package-lock.json`, `requirements.txt`, Docker/compose files, CI workflows, docs) small, targeted, and rebased immediately before opening a PR.
- Verify that exactly one Alembic migration head exists before and after database changes; never generate a second head and never edit an applied migration.
- Never resolve merge conflicts by discarding another contributor's changes; show both sides and ask the user for resolution.
- Run the full test suite and linter before declaring work complete; report any preexisting failure without skipping, modifying, or weakening tests.
- Never force-push, rewrite shared branch history, push directly to `main`, or delete branches you did not create.
- Include a handoff note in the PR description specifying what changed, collaborator setup steps (migrations, npm install, css rebuild), and verification steps.

## 3. Record-keeping
- Update `COMMITS.md` for every commit at the top under `# Commit log`, newest first, using:
  `### YYYY-MM-DD HH:MM (IST) | type: summary` followed by `- Author: <git user.name>`, `- Issue: #<number> or "none"`, `- Branch: <branch>`, `- Files changed: <path>`, `- What and why: <text>`, `- How it was verified: <text>`.
- Never include commit hashes in `COMMITS.md` and never amend commits to inject hashes.
- Update `UPDATES.md` at the top under `# Updates` for every user-visible change using:
  `### YYYY-MM-DD - Title (Done)`, `- Files modified: <paths>`, `- Summary: <plain bullets>`, `- Verification: <counts and tests>`, `- Issue: #<number>`.
- Skip `UPDATES.md` only for pure refactors, formatting, CI-only, or test-only changes, and state the skip in the response.
- Stage and commit `COMMITS.md` and `UPDATES.md` within the exact same commit series as the code, never in a trailing cleanup commit.

## 4. Project overview
ShopScale is an e-commerce web application built to study cloud auto-scaling, containerization, and resilience patterns on AWS. It implements product search, cart, atomic checkout, and orders via a decoupled architecture. Frontend browser clients communicate solely through an Express reverse-proxy to a FastAPI backend backed by MySQL 8.0.

```
shopscale/
|-- backend/          # FastAPI app, SQLAlchemy models, schemas, routers, tests
|-- frontend/         # Express server, Tailwind input, public HTML/JS/CSS
|-- database/         # Alembic migrations and deterministic seed scripts
|-- browser-tests/    # Playwright end-to-end browser journey suites
|-- load-tests/       # Locust load test scenarios and configurations
|-- infrastructure/   # AWS deployment templates and cloud manifests
|-- monitoring/       # CloudWatch, metric dashboards, and alert configs
|-- docs/             # Technical docs, architecture, and ADRs (decisions/)
`-- .github/          # Workflows (ci.yml) and issue templates
```

## 5. Milestone status
| Milestone | Description | Status | Date |
|---|---|---|---|
| M0 | Skeleton: Directory structure, base configs, docs, logs | In progress | 2026-10-24 |
| M1 | Backend: FastAPI core, config, /health, OpenAPI docs | Not started | - |
| M2 | Database: MySQL 8.0 models, Alembic migration, seed data | Not started | - |
| M3 | Frontend: Express proxy, Tailwind CLI, vanilla JS flows | Not started | - |
| M4 | Tests & CI: Pytest, Playwright, Locust, GitHub Actions | Not started | - |
| Stretch | Docker Compose full stack orchestration & AWS infra | Not started | - |

- Update the milestone row status to "Done" only when all corresponding stage exit criteria are satisfied.

## 6. Setup and run commands
- Install backend dependencies: `pip install -r backend/requirements.txt`
- Install frontend dependencies: `npm --prefix frontend install`
- Build Tailwind CSS: `npm --prefix frontend run build:css`
- Watch Tailwind CSS during dev: `npm --prefix frontend run watch:css`
- Run frontend Express server: `npm --prefix frontend start` (serves port 3000)
- Run backend FastAPI server: `uvicorn app.main:app --app-dir backend --reload --port 8000`
- Run database migrations: `alembic -c database/alembic.ini upgrade head`
- Run database seed script: `python database/seed.py`
- Run full stack with Docker Compose: `docker compose up --build`
- Mark any untested or unverified platform command with "VERIFY" before running.

## 7. Test and lint commands
- Run backend unit/API tests: `pytest backend/tests`
- Run backend linter: `flake8 backend/app`
- Run frontend linter: `npm --prefix frontend run lint`
- Run Playwright smoke tests: `npx --prefix browser-tests playwright test`
- Run Locust load simulation: `locust -f load-tests/locustfile.py --headless -u 10 -r 2 -t 30s --host http://localhost:3000`
- Run all test and lint commands locally and ensure they pass before declaring any task complete.

## 8. Code style
- Use Python 3.11+ type hints on every function signature and Pydantic model.
- Write docstrings for every public Python function, class, and FastAPI route.
- Write modern JavaScript (ES modules, `async/await`, `const`/`let`, no `var`).
- Add JSDoc comments to every public JavaScript function and export.
- Use Tailwind CSS utility classes in HTML markup; never write custom inline styles or ad-hoc CSS files.
- Name files in kebab-case (`product-card.js`) or snake_case (`order_service.py`), keeping files under 300 lines.

## 9. Architecture rules
- Route all frontend network requests exclusively through the Express `/api/*` reverse proxy (`BACKEND_URL`).
- Never allow browser client code to communicate directly with the FastAPI backend port.
- Keep business logic isolated in `backend/app/services/` and database access in `backend/app/models/`.
- Never import or call database models directly from frontend client code or routers without schemas.
- Never install new UI frameworks (React, Vue, Svelte), heavy ORMs, alternative auth libraries, or external CDN scripts without explicit approval.

## 10. Security rules
- Never commit secrets, passwords, API keys, or live credentials to code or Git.
- Declare and document all configurable secrets and settings in `.env.example` with non-sensitive placeholder values.
- Hash all user passwords using bcrypt before saving to the database.
- Validate and sanitize all incoming payloads on the server using Pydantic schemas.
- Enforce role-based access control (`is_admin`) strictly on backend endpoints, not just in UI logic.
- Render dynamic user text exclusively through DOM `textContent` or safe element attributes; never assign user data to raw `innerHTML`.
- Use SQLAlchemy parameterized queries or ORM expressions exclusively; never concatenate raw SQL strings.

## 11. Database rules
- Create an Alembic migration script for every single database schema modification.
- Ensure all indexed MySQL `VARCHAR` columns declare explicit length constraints (e.g. `VARCHAR(255)`).
- Store monetary values using `DECIMAL(10, 2)` columns, never floating-point types.
- Ensure `database/seed.py` is strictly deterministic, generating identical records on every run.
- Wrap all product stock decrements and order creation steps in explicit database transactions using row-level locks (`SELECT ... FOR UPDATE`).

## 12. Git and PR rules
- Name branches following the pattern `type/issue-number-short-name` (e.g. `feat/12-cart-api`).
- Format every commit message as `type: summary` (using `feat`, `fix`, `chore`, `docs`, `test`, `infra`).
- Restrict each Git branch to a single task or issue.
- Match PR titles to the commit message format and include `Closes #<issue>` in the description.
- Use GitHub squash merges exclusively when merging into `main`.
- Keep pull requests under approximately 300 changed lines to facilitate thorough review.
- Update technical documentation in `docs/` whenever system behavior or configuration changes.

## 13. Testing and Definition of Done
- Consider a task done only when:
  - All functional acceptance criteria are satisfied.
  - All local unit, integration, and lint checks pass cleanly.
  - GitHub Actions CI builds pass without errors.
  - Relevant documentation, API docs, and architecture notes are updated.
  - `COMMITS.md` has logged every commit and `UPDATES.md` has logged user-visible additions.
  - Zero secrets or sensitive artifacts exist in code, logs, or Git history.

## 14. Load and cloud safety
- Target load generation scripts exclusively against dedicated local or isolated staging instances.
- Use synthetic test accounts only; never inject real user credentials into load scenarios.
- Enforce strict concurrency limits and a fixed test duration on all Locust test runs.
- Never configure load tests to execute automatically on production or without human supervision.
- Never provision AWS cloud resources without active budget billing alerts configured.
- Log cost estimates per experiment in `docs/` and tear down all AWS resources immediately after each benchmark session.

## 15. Agent behaviour
- State all assumptions clearly to the user before implementing non-trivial changes.
- Stop and ask for clarification immediately whenever instructions or requirements conflict.
- Implement the smallest, cleanest change that completely satisfies the task.
- Never refactor, reformat, or reorganize unrelated code.
- Never delete or rename files outside the immediate scope of the approved task.
- Never guess or invent library version numbers, endpoint signatures, or CLI commands.
- Print complete file contents in code blocks when presenting files; never truncate with `...` or "rest unchanged".
- Provide a summary of files changed and verification commands at the end of every completed stage.

## 16. Do-not-touch list
- Never modify files or directories in the following paths without explicit user approval:
  - `.github/workflows/`
  - `infrastructure/`
  - `database/alembic/versions/` (historical applied migration scripts)
  - `.env*` environment files (except updating `.env.example`)
  - `package-lock.json` or dependency lockfiles directly (use package managers only)
  - Active feature branches owned by other contributors
- Touch `COMMITS.md` and `UPDATES.md` strictly according to the record-keeping protocol in Section 3; do not edit or reorder older entries.
