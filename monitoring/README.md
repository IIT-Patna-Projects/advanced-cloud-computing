# Monitoring & Observability

This directory contains configuration definitions, dashboards, and alarms for observing ShopScale under load testing on AWS.

## Components
- **Metrics**: FastAPI request rate, response latency percentiles (p50, p95, p99), HTTP 5xx error rates, MySQL active connections and deadlocks.
- **Dashboards**: Amazon CloudWatch dashboard JSON definitions.
- **Alerts**: Budget alerts and high-error-rate alarm policies.
