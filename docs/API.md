# API Contract (ShopScale REST API Specification)

This document establishes the official REST API contract between the ShopScale Express frontend proxy and the FastAPI backend service.
Both contributors must review and sign off on this contract before backend route implementations proceed.

- **Base URL (Direct Backend)**: `http://localhost:8000`
- **Reverse Proxy URL (Frontend Entrypoint)**: `http://localhost:3000/api`
- **Specification Standard**: OpenAPI 3.1 / JSON REST
- **Default Content-Type**: `application/json`
- **Authentication Scheme**: HTTP Authorization header with Bearer JWT token (`Authorization: Bearer <access_token>`)

---

## 1. Architectural Topology & Routing

The frontend client running in the user browser never communicates directly with the FastAPI backend port.
All client network traffic routes through the Express reverse-proxy (`frontend/server.js`):

```
[ Browser Client ]
       |
       |  HTTP (:3000)
       v
[ Express Server (frontend/server.js) ]
       |  - Serves static assets (/public)
       |  - Security headers & error suppression
       |  - Health probe: GET /healthz
       |  - Reverse-proxy rewrite: /api/* -> /*
       |
       |  HTTP (:8000)
       v
[ FastAPI Backend (backend/app/main.py) ]
       |  - Pydantic v2 validation
       |  - JWT stateless authentication
       |  - Endpoints: /health, /auth, /products, /cart, /orders, /admin
       |
       |  Async MySQL (:3306)
       v
[ MySQL 8.0 Database (InnoDB) ]
          - ACID Transactions
          - SELECT ... FOR UPDATE row-level locking
```

---

## 2. Standardized Error Envelope

All error responses across all endpoints adhere to a consistent JSON structure to allow predictable error handling in client scripts:

```json
{
  "error": "Human-readable error description",
  "code": "MACHINE_READABLE_ERROR_CODE",
  "status": 400,
  "details": []
}
```

### Standard HTTP Status Codes

| Status Code | Description | Standard Code Identifier |
|---|---|---|
| `200 OK` | Request succeeded; returned payload matches schema. | - |
| `201 Created` | Resource created successfully. | - |
| `204 No Content` | Action succeeded with no response body. | - |
| `400 Bad Request` | Malformed request body, invalid parameter, or negative quantity. | `BAD_REQUEST` |
| `401 Unauthorized` | Missing, expired, or malformed JWT Bearer token. | `UNAUTHORIZED` |
| `403 Forbidden` | Authenticated user lacks required role (`is_admin=True` required). | `FORBIDDEN` |
| `404 Not Found` | Requested resource (product, order item) does not exist. | `NOT_FOUND` |
| `409 Conflict` | Business rule conflict (duplicate email, insufficient inventory). | `CONFLICT` / `INSUFFICIENT_STOCK` |
| `422 Unprocessable`| Pydantic schema validation failure. | `VALIDATION_ERROR` |
| `500 Internal Error`| Unhandled server exception (stack trace masked in production). | `INTERNAL_SERVER_ERROR` |

---

## 3. Endpoints Specification

### 3.1 System Health & Diagnostics

#### `GET /health` (`GET /api/health`)
Evaluates FastAPI operational health and validates asynchronous MySQL database connectivity via `pool_pre_ping`.

- **Authentication**: None (Public)
- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "version": "0.1.0",
    "database": "connected"
  }
  ```
- **Response `200 OK` (Degraded Database Fallback)**:
  ```json
  {
    "status": "healthy",
    "version": "0.1.0",
    "database": "disconnected"
  }
  ```

#### `GET /healthz`
Frontend Node.js Express server process health probe.

- **Authentication**: None (Public)
- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "service": "shopscale-frontend",
    "timestamp": "2026-10-25T13:30:00.000Z"
  }
  ```

---

### 3.2 Authentication & Identity

#### `POST /auth/register` (`POST /api/auth/register`)
Creates a new customer account with bcrypt password hashing.

- **Authentication**: None (Public)
- **Request Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "SecurePassword123",
    "full_name": "Priyanshu Sharma"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "id": 1,
    "email": "customer@example.com",
    "full_name": "Priyanshu Sharma",
    "is_admin": false,
    "created_at": "2026-10-25T13:30:00Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid email format or password under 8 characters.
  - `409 Conflict`: `{ "error": "Email already registered", "code": "EMAIL_EXISTS", "status": 409 }`

#### `POST /auth/login` (`POST /api/auth/login`)
Authenticates user credentials and issues a stateless JSON Web Token (JWT).

- **Authentication**: None (Public)
- **Request Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 86400,
    "user": {
      "id": 1,
      "email": "customer@example.com",
      "full_name": "Priyanshu Sharma",
      "is_admin": false
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: `{ "error": "Invalid email or password", "code": "INVALID_CREDENTIALS", "status": 401 }`

#### `GET /auth/me` (`GET /api/auth/me`)
Retrieves the profile of the currently authenticated user.

- **Authentication**: Required (`Bearer <token>`)
- **Response `200 OK`**:
  ```json
  {
    "id": 1,
    "email": "customer@example.com",
    "full_name": "Priyanshu Sharma",
    "is_admin": false
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: `{ "error": "Invalid or expired session token", "code": "UNAUTHORIZED", "status": 401 }`

---

### 3.3 Catalog & Products

#### `GET /products` (`GET /api/products`)
Lists products with optional text search, category filtering, sorting, and pagination.

- **Authentication**: None (Public)
- **Query Parameters**:
  - `search` (string, optional): Substring match against product name and description.
  - `category` (string, optional): Exact filter by category (`Compute`, `Database`, `Storage`, `Networking`, `AI / ML`, `Observability`).
  - `sort` (string, optional): Sorting order (`price_asc`, `price_desc`, `name_asc`, `sla`). Default: `featured`.
  - `page` (integer, optional, default: 1): Page number (1-indexed).
  - `limit` (integer, optional, default: 12): Items per page (maximum: 50).
- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "id": 1,
        "name": "AWS EC2 c6i.2xlarge Compute Node",
        "category": "Compute",
        "description": "High performance compute instance powered by 3rd Gen Intel Xeon Scalable processors.",
        "price": 49.99,
        "stock": 42,
        "sla": "99.99% Availability SLA",
        "specs": {
          "vCPU": "8 vCPU",
          "Memory": "16 GiB RAM",
          "Network": "Up to 12.5 Gbps",
          "Storage": "EBS-Only"
        },
        "image": "/images/ec2.svg",
        "badge": "Scalable",
        "created_at": "2026-10-24T00:00:00Z"
      }
    ],
    "total": 12,
    "page": 1,
    "limit": 12,
    "total_pages": 1
  }
  ```

#### `GET /products/{id}` (`GET /api/products/{id}`)
Fetches complete technical specifications, SLA details, and stock level for a single product.

- **Authentication**: None (Public)
- **URL Parameters**: `id` (integer) - Unique product identifier.
- **Response `200 OK`**:
  ```json
  {
    "id": 1,
    "name": "AWS EC2 c6i.2xlarge Compute Node",
    "category": "Compute",
    "description": "High performance compute instance powered by 3rd Gen Intel Xeon Scalable processors.",
    "price": 49.99,
    "stock": 42,
    "sla": "99.99% Availability SLA",
    "specs": {
      "vCPU": "8 vCPU",
      "Memory": "16 GiB RAM",
      "Network": "Up to 12.5 Gbps",
      "Storage": "EBS-Only"
    },
    "image": "/images/ec2.svg",
    "badge": "Scalable",
    "created_at": "2026-10-24T00:00:00Z"
  }
  ```
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Product not found", "code": "PRODUCT_NOT_FOUND", "status": 404 }`

---

### 3.4 Shopping Cart

The shopping cart maintains item lines per authenticated user. Guest users store cart state in browser `localStorage` and synchronize with the backend upon authentication.

#### `GET /cart` (`GET /api/cart`)
Retrieves the active cart for the authenticated user with calculated line totals, taxes, and grand total.

- **Authentication**: Required (`Bearer <token>`)
- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "product_id": 1,
        "name": "AWS EC2 c6i.2xlarge Compute Node",
        "price": 49.99,
        "quantity": 2,
        "image": "/images/ec2.svg",
        "category": "Compute",
        "subtotal": 99.98
      }
    ],
    "subtotal": 99.98,
    "tax": 8.00,
    "shipping": 0.00,
    "total": 107.98
  }
  ```
- **Response `200 OK` (Empty Cart)**:
  ```json
  {
    "items": [],
    "subtotal": 0.00,
    "tax": 0.00,
    "shipping": 0.00,
    "total": 0.00
  }
  ```

#### `POST /cart/items` (`POST /api/cart/items`)
Adds an item to the user cart or increments the quantity if already present.

- **Authentication**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "product_id": 1,
    "quantity": 1
  }
  ```
- **Response `200 OK` / `201 Created`**: Returns the complete updated cart payload.
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "Quantity must be at least 1", "code": "INVALID_QUANTITY", "status": 400 }`
  - `404 Not Found`: `{ "error": "Product not found", "code": "PRODUCT_NOT_FOUND", "status": 404 }`
  - `409 Conflict`: `{ "error": "Requested quantity exceeds available stock", "code": "INSUFFICIENT_STOCK", "status": 409 }`

#### `PUT /cart/items/{product_id}` (`PUT /api/cart/items/{product_id}`)
Updates the exact quantity of an existing cart line item.

- **Authentication**: Required (`Bearer <token>`)
- **URL Parameters**: `product_id` (integer)
- **Request Body**:
  ```json
  {
    "quantity": 3
  }
  ```
- **Response `200 OK`**: Returns the complete updated cart payload.
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "Quantity must be greater than 0", "code": "INVALID_QUANTITY", "status": 400 }`
  - `404 Not Found`: `{ "error": "Item not found in cart", "code": "ITEM_NOT_IN_CART", "status": 404 }`
  - `409 Conflict`: `{ "error": "Requested quantity exceeds available stock", "code": "INSUFFICIENT_STOCK", "status": 409 }`

#### `DELETE /cart/items/{product_id}` (`DELETE /api/cart/items/{product_id}`)
Removes a product line item entirely from the user's cart.

- **Authentication**: Required (`Bearer <token>`)
- **URL Parameters**: `product_id` (integer)
- **Response `200 OK`**: Returns updated cart payload.
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Item not found in cart", "code": "ITEM_NOT_IN_CART", "status": 404 }`

---

### 3.5 Order Creation & Checkout (ACID Concurrency)

#### `POST /orders` (`POST /api/orders`)
Places an order from the user's active cart or explicit item payload, executing atomic inventory verification under row-level database locking.

- **Authentication**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "unit_price": 49.99
      }
    ],
    "shipping_address": {
      "full_name": "Priyanshu Sharma",
      "company": "IIT Patna",
      "region": "us-east-1",
      "vpc_id": "vpc-0a1b2c3d4e5f67890",
      "address_line": "Cloud Innovation Lab, Admin Block",
      "postal_code": "801106"
    },
    "payment_method": "cloud_credit",
    "notes": "Deploy in private subnet"
  }
  ```

#### Transaction & Concurrency Protocol:
1. Opens an explicit MySQL InnoDB transaction (`async with session.begin():`).
2. Issues row-level lock on involved product rows:
   ```sql
   SELECT id, name, stock, price FROM products WHERE id IN (:ids) FOR UPDATE;
   ```
3. Verifies that `available_stock >= requested_quantity` for every item:
   - If any item violates stock constraints:
     - Transaction rolls back automatically (`ROLLBACK`).
     - Product stock and shopping cart remain completely untouched.
     - Returns `409 Conflict`:
       ```json
       {
         "error": "Not enough stock for AWS EC2 c6i.2xlarge Compute Node",
         "code": "INSUFFICIENT_STOCK",
         "status": 409,
         "product_id": 1,
         "requested_quantity": 5,
         "available_stock": 2
       }
       ```
4. If all items have sufficient stock:
   - Decrements stock for each product:
     ```sql
     UPDATE products SET stock = stock - :quantity WHERE id = :id;
     ```
   - Inserts order record into `orders` table with status `'confirmed'`.
   - Inserts order lines into `order_items` table.
   - Clears cart records for the authenticated user.
   - Transaction commits (`COMMIT`).
5. Returns `201 Created`:
   ```json
   {
     "order_id": "ORD-20261025-9842",
     "status": "confirmed",
     "total": 107.98,
     "subtotal": 99.98,
     "tax": 8.00,
     "shipping": 0.00,
     "created_at": "2026-10-25T13:30:00Z",
     "transaction_hash": "tx-8f92a10c-3b4e-4f1a-b8d2-5a7c9e1f3a2b",
     "items": [
       {
         "product_id": 1,
         "name": "AWS EC2 c6i.2xlarge Compute Node",
         "quantity": 2,
         "unit_price": 49.99,
         "subtotal": 99.98
       }
     ]
   }
   ```

#### `GET /orders` (`GET /api/orders`)
Retrieves the authenticated user's order history, sorted newest first. A user can only access their own orders.

- **Authentication**: Required (`Bearer <token>`)
- **Response `200 OK`**:
  ```json
  [
    {
      "order_id": "ORD-20261025-9842",
      "status": "confirmed",
      "total": 107.98,
      "item_count": 2,
      "created_at": "2026-10-25T13:30:00Z",
      "transaction_hash": "tx-8f92a10c-3b4e-4f1a-b8d2-5a7c9e1f3a2b"
    }
  ]
  ```

#### `GET /orders/{order_id}` (`GET /api/orders/{order_id}`)
Retrieves full details of a specific order including item lines, shipping address, and timestamp.

- **Authentication**: Required (`Bearer <token>`)
- **URL Parameters**: `order_id` (string, e.g. `ORD-20261025-9842`)
- **Response `200 OK`**: Returns complete order payload.
- **Error Responses**:
  - `404 Not Found`: Order does not exist or belongs to another user (`{ "error": "Order not found", "code": "ORDER_NOT_FOUND", "status": 404 }`).

---

### 3.6 Administrator Product Management

Restricted to users with `is_admin=True`. Non-admin users receive `403 Forbidden`.

#### `POST /admin/products` (`POST /api/admin/products`)
Creates a new catalog product item.

- **Authentication**: Required (`Bearer <token>`, Admin role)
- **Request Body**:
  ```json
  {
    "name": "AWS Lambda Serverless Function",
    "category": "Compute",
    "description": "Event-driven compute service with sub-second scaling.",
    "price": 19.99,
    "stock": 100,
    "sla": "99.95% Availability SLA",
    "specs": {
      "Runtime": "Node.js / Python",
      "Concurrency": "1,000 Concurrent Executions",
      "Memory": "128 MB to 10 GB"
    },
    "image": "/images/lambda.svg",
    "badge": "Serverless"
  }
  ```
- **Response `201 Created`**: Returns created product entity with assigned `id`.
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token.
  - `403 Forbidden`: User is not an administrator.

#### `PUT /admin/products/{id}` (`PUT /api/admin/products/{id}`)
Updates pricing, inventory stock, or descriptions of an existing product.

- **Authentication**: Required (`Bearer <token>`, Admin role)
- **URL Parameters**: `id` (integer)
- **Request Body**: Partial or full product fields to update.
- **Response `200 OK`**: Returns updated product object.
- **Error Responses**:
  - `401 Unauthorized`: Missing token.
  - `403 Forbidden`: Not admin.
  - `404 Not Found`: Product ID does not exist.

#### `DELETE /admin/products/{id}` (`DELETE /api/admin/products/{id}`)
Deletes a product from the active catalog.

- **Authentication**: Required (`Bearer <token>`, Admin role)
- **URL Parameters**: `id` (integer)
- **Response `200 OK`**:
  ```json
  {
    "message": "Product deleted successfully",
    "product_id": 1
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing token.
  - `403 Forbidden`: Not admin.
  - `404 Not Found`: Product ID does not exist.

---

## 4. Teammate Sign-off & Review Status

| Contributor | Role | Sign-off Status | Date |
|---|---|---|---|
| **PriyanshuKSharma** (`@PriyanshuKSharma`) | Backend & Architecture Lead | Signed off | 2026-10-25 |
| **garimasharma2607mte69** (`@itspriyanshuks17`) | Frontend & Integration Contributor | Signed off (Draft integrated) | 2026-10-25 |

Any future breaking change to request/response shapes, endpoint URLs, or status codes requires explicit written approval from both contributors and must define a backward-compatible deprecation path per **Section 1 of `AGENTS.md`**.
