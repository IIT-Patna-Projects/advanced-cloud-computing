# ShopScale Technical Documentation

Welcome to the ShopScale technical documentation repository.

## Documentation Index

- **[Master Implementation Plan](../plan.md)**: Master architectural plan, milestones, and deliverable specifications.
- **[REST API Contract](API.md)**: Comprehensive OpenAPI specification for catalog, cart, orders, and authentication.
- **[Architectural Decision Records (ADRs)](decisions/)**:
  - [0001: Use MySQL 8.0 and aiomysql](decisions/0001-use-mysql-and-aiomysql.md)
- **[Multi-Contributor Guidelines](../AGENTS.md)**: Repository rules, code protection protocols, and commit guidelines.
- **[Contribution Guide](../CONTRIBUTING.md)**: Workflow instructions, PR conventions, and quality gates.

## AWS Cloud Scaling Architecture

ShopScale is architected to test and benchmark the following AWS patterns:
1. **Compute Auto-Scaling**: Dynamic scaling of containerized FastAPI worker tasks behind an Application Load Balancer (ALB).
2. **Reverse Proxy Caching**: Static asset offloading via Express / CloudFront edge locations.
3. **Database Concurrency Under Spikes**: Evaluating MySQL 8.0 connection pool saturation and InnoDB row locking under Locust synthetic checkout surges.
