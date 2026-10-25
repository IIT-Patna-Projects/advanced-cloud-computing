# API Contract (Draft)

Proposed contract between the frontend and the FastAPI backend.
Both teammates must agree before building. Base path: `/api`.
The Express server proxies `/api/*` to FastAPI (port 8000).

Authentication: after login, send `Authorization: Bearer <token>`.

## Health
- `GET /health` returns `{ "status": "ok" }`

## Auth
- `POST /auth/register` with `{ "email", "password" }` returns 201 `{ "id", "email" }`
- `POST /auth/login` with `{ "email", "password" }` returns 200 `{ "access_token", "token_type": "bearer" }`

## Products
- `GET /products?search=&page=` returns 200 a list of `{ "id", "name", "price", "stock", "image" }`
- `GET /products/{id}` returns 200 one product, or 404 `{ "error": "Product not found" }`

## Cart (login required)
- `GET /cart` returns 200 `{ "items": [{ "product_id", "name", "price", "quantity" }], "total" }`
- `POST /cart/items` with `{ "product_id", "quantity" }` adds an item
- `PUT /cart/items/{product_id}` with `{ "quantity" }` changes the quantity
- `DELETE /cart/items/{product_id}` removes an item

## Orders (login required)
- `POST /orders` places an order from the cart and returns 201 `{ "order_id", "total", "status": "confirmed" }`
  - 409 `{ "error": "Not enough stock for <product name>" }` if stock is too low
- `GET /orders` returns 200 the user's past orders: `[{ "order_id", "total", "status", "created_at" }]`

## Admin (admin role required)
- `POST /admin/products` creates a product
- `PUT /admin/products/{id}` updates a product
- `DELETE /admin/products/{id}` removes a product

## Error format
All errors return `{ "error": "<message>" }` with the matching status code:
400 bad input, 401 not logged in, 403 not allowed, 404 not found, 409 conflict.

## Status
Draft for review. Any change to this file needs both teammates' approval.
