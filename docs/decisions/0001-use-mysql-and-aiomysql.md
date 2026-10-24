# ADR 0001: Use MySQL 8.0 and aiomysql

## Context
ShopScale was originally conceived with PostgreSQL. To study database performance characteristics, row-locking behavior, and auto-scaling patterns under MySQL InnoDB on AWS (e.g., Amazon RDS / Aurora MySQL), the database engine was revised to MySQL 8.0.

In FastAPI, synchronous database drivers block the asynchronous event loop during long-running I/O operations, drastically capping request throughput under synthetic load tests.

## Decision
1. **Database Engine**: We adopt **MySQL 8.0** as the primary relational database.
2. **FastAPI Asynchronous Driver**: We utilize **SQLAlchemy 2.0 with `aiomysql`** (`mysql+aiomysql://...`) for all backend application runtime queries and connection pooling.
3. **Migration Driver**: We use Alembic with synchronous `pymysql` for schema migrations to ensure stability during deployment pipelines.
4. **Dialect Schema Standards**:
   - All indexed `VARCHAR` columns must declare explicit length bounds (e.g. `VARCHAR(255)`) to satisfy MySQL InnoDB index key prefix limitations.
   - All currency values must use `DECIMAL(10, 2)` to eliminate floating-point representation anomalies.
   - Atomic checkout must wrap stock decrement operations in explicit InnoDB transactions using row locks (`SELECT ... FOR UPDATE`).

## Consequences
- **Positive**:
  - Non-blocking asynchronous I/O across all FastAPI route handlers.
  - Consistent behavior with AWS RDS MySQL 8.0 targets.
  - Deterministic row locking during simulated flash-crowd checkout surges.
- **Negative / Constraints**:
  - Developers must maintain separate connection URL strings for async runtime (`aiomysql`) vs. synchronous migration scripts (`pymysql`).
