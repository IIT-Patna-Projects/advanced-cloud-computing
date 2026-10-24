# Infrastructure as Code (IaC)

This directory contains AWS infrastructure templates, container definitions, and deployment manifests for ShopScale.

## Deployment Target
- **AWS ECS (Fargate) / App Runner**: Host containerized FastAPI backend and Express frontend.
- **Amazon RDS for MySQL 8.0**: Multi-AZ managed database instance.
- **Application Load Balancer (ALB)**: Traffic routing, SSL termination, and target health checks.
- **AWS Budgets**: Automated alarms to prevent cost overruns during benchmarking.
