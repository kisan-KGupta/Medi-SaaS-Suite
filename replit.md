# Sanjay Medical — Pharmacy Management System

A modern pharmacy management SaaS for Sanjay Medical, Horizon Chowk, Butwal, Nepal.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/pharmacy run dev` — run the pharmacy frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — auth token signing

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Auth: Custom HMAC token (in-memory), stored as `pharmacy_token` in localStorage
- Build: esbuild (CJS bundle)

## Default Credentials

- Admin: `admin` / `admin123`
- Cashier: `cashier` / `cashier123`

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — Drizzle DB schema (users, medicines, sales, purchases, etc.)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/pharmacy/src/pages/` — React pages (Dashboard, Billing, Inventory, etc.)
- `artifacts/pharmacy/src/lib/auth.tsx` — Auth context
- `artifacts/pharmacy/src/main.tsx` — Entry point (wires `setAuthTokenGetter`)

## Architecture decisions

- Token stored in localStorage as `pharmacy_token`; custom-fetch reads it via `setAuthTokenGetter`
- In-memory token store on the API server (tokens lost on restart — fine for MVP)
- Passwords hashed with Node.js `crypto.scryptSync` (no bcrypt dependency needed)
- Sales auto-decrement stock; purchases auto-increment stock
- Credit sales update customer's `credit_balance`

## Product

- Dashboard with live analytics (today/weekly/monthly sales, profit, low stock, expiry alerts)
- Medicine inventory management with expiry color-coding and category/supplier links
- Billing/POS optimized for speed with VAT, discount, and credit support
- Expiry tracking grouped by 30/60/90-day windows with urgency badges
- Supplier and purchase management (auto-stocks medicines)
- Customer credit/due management with payment recording
- Sales history with date filtering
- Analytics charts via Recharts

## User preferences

- Currency: NPR
- No emojis in UI
- Target users: pharmacy owners, cashiers, inventory managers in Nepal

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Token store is in-memory — users must log in again after API server restart
- Dashboard SQL uses raw `db.execute(sql\`...\`)` — check row access pattern (`result.rows` vs `result[0]`)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
