# Restaurant counter ordering app (React + Node demo)
Ordering staff at the counter pick dishes from the menu, add them to an order (with quantities), and submit the order to the kitchen. Kitchen staff see submitted orders on a separate screen.

## Stack
- Frontend: React + TypeScript (Vite) in `frontend/`
- Backend: Node + Express + TypeScript in `backend/`
- Database: keep it simple — in-memory only. The menu is a plain array of strings: `["Pasta", "Burger", "Noodle", "Beefsteak", "Banhmi", "Pizza"]` (`backend/src/data/store.ts`). Orders are lost on backend restart; this is intended.

## Architecture decisions
- Frontend and backend live in separate folders, each with its own `package.json` and lockfile. There is no root package or workspace.
- Follow production standards: strict TypeScript, validate all input on the backend, consistent JSON errors (`{ error }`), config via environment variables, tests for new behaviour.
- Backend: `createApp()` in `src/app.ts` builds the Express app with injectable dependencies (e.g. `OrderStore`) so tests use Supertest without a real port. `src/server.ts` is only the entry point. Routes are factory functions in `src/routes/`; validation errors throw `ValidationError`, which the central error handler maps to HTTP 400.
- Frontend: all HTTP calls go through `src/api/client.ts`; order-building state lives in `src/hooks/useOrder.ts`; screens are `CounterView` and `KitchenView` in `src/components/`. In dev, Vite proxies `/api` to the backend on port 4000.
- The order quantity limit (`MAX_QUANTITY = 99`) exists on both sides; keep them in sync.

## API
- `GET /api/health`, `GET /api/menu` → `{ items: string[] }`
- `GET /api/orders` → `{ orders: Order[] }` (newest first)
- `POST /api/orders` with `{ items: [{ name, quantity }] }` → 201 `Order`, or 400 `{ error }`

When you change the API, update `README.md`, both `types.ts` files and the tests on both sides.

## Commands
Run inside `backend/` or `frontend/`:

| Task | backend | frontend |
|---|---|---|
| Install | `npm ci` | `npm ci` |
| Dev server | `npm run dev` (port 4000) | `npm run dev` (port 5173) |
| Tests | `npm test` | `npm test` |
| Type check | `npm run typecheck` | `npm run typecheck` |
| Lint | — | `npm run lint` (oxlint) |
| Build | `npm run build` | `npm run build` |

Before committing, run tests and build in each folder you changed. They're the same checks CI runs.

## Coding style
- Docstrings (Google style: `Args:`, `Returns:`, `Raises:`) inside TSDoc `/** */` comments for every exported function, class and component.
- Match the style of the folder you're in:
  - backend: double quotes, semicolons, ESM with `.js` extensions on relative imports (`NodeNext`)
  - frontend: single quotes, no semicolons (Vite template style)
- Tests: backend in `backend/tests/` (Vitest + Supertest); frontend in `frontend/src/__tests__/` (Vitest + React Testing Library). Query by accessible role/label, not CSS classes.
- User-facing text uses Australian English (e.g. "colour", "organise"); times are formatted with the `en-AU` locale.

## CI (GitHub Actions)
- `.github/workflows/ci.yml` runs on pushes to `main` and on pull requests: a backend and a frontend job, each doing `npm ci`, lint (frontend), tests and build on Node 24.
- **npm is pinned to 11.6.2 in CI.** npm versions before 11.6.1 fail `npm ci` on these lockfiles with `Missing: @emnapi/core@2.0.0-beta.2 from lock file` (an npm bug with optional dependencies; regenerating the lockfile doesn't help). Generate lockfiles with npm ≥ 11.6.1 (`npm -v`). If you regenerate them with a newer npm, update the pin in `ci.yml` to match.
- Don't "fix" install failures by running `npm install` in CI. It rewrites the lockfile, so CI no longer tests the dependency versions that were committed.
- Tests must not run automatically on local changes: no git hooks, husky, lint-staged or similar. CI is the only automated test run.

## Toolchain notes
- Requires Node ≥ 20; CI uses Node 24. The frontend's Vitest 5 lists Node `^22.12 || ^24 || >=26` as supported.
- The dependencies are very recent major versions (TypeScript 7, Vite 8, Express 5, React 19, Vitest 4/5). Check the APIs of the installed versions rather than relying on older docs.

## Plan-first policy
- Every feature deploy on >1 file -> MUST goto Plan Mode first.
- Use Plan Mode when changing code or modifying files.
- Bash commands don't need Plan Mode (e.g. running tests, builds, type checks, lint, `npm ci`, dev servers, git status/log/diff). Run them directly in Auto mode.

## Git
- Branch from `main` for changes and open a pull request; CI must pass before merging.
- Write commit messages in the imperative mood, with a short summary line and a body explaining why.
