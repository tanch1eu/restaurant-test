# Restaurant Orders

A simple counter-ordering app. Counter staff pick dishes from the menu, build an
order, and submit it to the kitchen. Kitchen staff see submitted orders on the
**Kitchen** tab, which refreshes every 5 seconds.

```
backend/   Node + Express + TypeScript REST API (in-memory data)
frontend/  React + TypeScript (Vite) single-page app
```

## Requirements
- Node.js 20 or later

## Run locally
In two terminals:

```bash
cd backend && npm install && npm run dev     # API on http://localhost:4000
cd frontend && npm install && npm run dev    # UI on http://localhost:5173
```

The Vite dev server proxies `/api` to the backend.

## Test and build
```bash
cd backend && npm test && npm run build
cd frontend && npm test && npm run lint && npm run build
```

## API
| Method | Path          | Description                                   |
|--------|---------------|-----------------------------------------------|
| GET    | `/api/health` | Health check                                  |
| GET    | `/api/menu`   | `{ items: string[] }`                         |
| GET    | `/api/orders` | `{ orders: Order[] }`, newest first           |
| POST   | `/api/orders` | Body `{ items: [{ name, quantity }] }` → 201 `Order`, or 400 `{ error }` |

Quantities must be whole numbers from 1 to 99, and every name must be on the
menu. Duplicate lines are merged.

## Configuration
| Variable            | Where    | Default                 | Purpose                                   |
|---------------------|----------|-------------------------|-------------------------------------------|
| `PORT`              | backend  | `4000`                  | API port                                  |
| `CORS_ORIGIN`       | backend  | unset (CORS off)        | Comma-separated allowed origins, needed when the UI is served from another origin |
| `VITE_API_BASE_URL` | frontend | `/api`                  | API base URL baked into the build         |
| `API_PROXY_TARGET`  | frontend | `http://localhost:4000` | Dev proxy target                          |

## Limitations
Orders are kept in memory, so they're lost when the backend restarts.
