# Contributing to ShopScale

Thank you for contributing to ShopScale. We operate as a high-velocity, multi-contributor monorepo using trunk-based development with short-lived feature branches.

All contributors must read and adhere strictly to [AGENTS.md](AGENTS.md).

---

## 1. Branching Strategy

- **Branch Naming**: All branches must follow the convention:
  `type/issue-number-short-name`
  - Examples: `feat/1-catalog-api`, `fix/4-cart-lock`, `chore/7-docker-compose`, `docs/10-readme-update`.
- **Scope**: Exactly one task or issue per branch.
- **Base Branch**: Always branch from and merge into `main`.
- **Branch Synchronization**:
  Run `git fetch` and `git pull --rebase origin main` before starting work and immediately before opening a pull request to minimize merge conflicts.

---

## 2. Commit Message & Record-Keeping Protocol

### Commit Message Structure

Format each commit message as:
`type: summary`

Supported types:

- `feat`: A new user-facing or API feature
- `fix`: A bug fix
- `chore`: Maintenance, dependencies, or tool configurations
- `docs`: Documentation additions or revisions
- `test`: Adding or refactoring tests
- `infra`: Docker, CI/CD, and AWS deployment configurations

### Per-File Commits

Commit each modified file separately with its own descriptive `type: summary` message.

### Required Logs

1. **`COMMITS.md`**: For every commit, add an entry at the top of `COMMITS.md` under `# Commit log` using the following template:
   ```markdown
   ### YYYY-MM-DD HH:MM (IST) | type: summary
   - Author: <git user.name>
   - Issue: #<number> or "none"
   - Branch: <branch name>
   - Files changed: <short list of paths>
   - What and why: <one or two sentences>
   - How it was verified: <tests run or manual check>
   ```
2. **`UPDATES.md`**: Whenever a commit introduces, alters, or fixes user-visible behavior, add a bullet item at the top of `UPDATES.md` under the appropriate category (`Added`, `Changed`, `Fixed`, `Removed`).

Both `COMMITS.md` and `UPDATES.md` must be committed within the exact same commit series as the code, never in a trailing cleanup commit.

---

## 3. Pull Request Guidelines

1. **Size Limit**: Keep PRs small—aim for under ~300 changed lines to ensure thorough review.
2. **PR Title**: Match the commit format: `type: summary` (e.g. `feat: implement product search endpoint`).
3. **PR Description**: Include `Closes #<issue>` and a handoff note covering:
   - What changed
   - Any collaborator setup instructions (e.g., migrations, npm install, CSS rebuild)
   - Verification commands and test output
4. **Merge Strategy**: Use GitHub Squash and Merge exclusively when merging into `main`.

---

## 4. Quality & Pre-PR Checklist

Before marking a pull request ready for review, verify:

- [ ] Backend tests pass: `pytest backend/tests`
- [ ] Backend linter passes: `flake8 backend/app`
- [ ] Frontend linter passes: `npm --prefix frontend run lint`
- [ ] Tailwind CSS compiles without errors: `npm --prefix frontend run build:css`
- [ ] Playwright smoke tests pass: `npx --prefix browser-tests playwright test`
- [ ] Exactly one Alembic migration head exists: `alembic -c database/alembic.ini heads`
- [ ] Zero secrets, live credentials, or `.env` files committed.
- [ ] `COMMITS.md` and `UPDATES.md` are updated.
