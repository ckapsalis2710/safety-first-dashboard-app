# @safety-first/api

NestJS + TypeScript API for SafetyFirst Dashboard (step 1).

## Stack

- NestJS 11
- Drizzle ORM
- PostgreSQL 16 (`docker compose`)
- Types from `@safety-first/shared`

## Prerequisites

1. Node 20+
2. Docker (for Postgres) — or any Postgres reachable via `DATABASE_URL`

## Setup

From the **repo root**:

```bash
# Install workspaces
npm install

# Start Postgres
npm run db:up

# Push schema (creates tables)
npm run db:push

# Seed from mock data (equivalent to apps/web/src/data/mockData.ts)
npm run db:seed

# Run API (watch mode)
npm run dev:api
```

API defaults to **http://localhost:3000**.

Copy `.env.example` → `.env` at the repo root (and/or `apps/api/.env`) if needed:

```
DATABASE_URL=postgresql://safety:safety@localhost:5432/safety_first
PORT=3000
```

## REST endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness |
| GET | `/workers` | List workers |
| GET | `/workers/:id` | Worker by id |
| GET | `/alerts` | List alerts |
| PATCH | `/alerts/:id/acknowledge` | Acknowledge alert (`{ "acknowledgedBy": "..." }` optional) |
| GET | `/incidents` | List incidents |
| GET | `/stats` | Dashboard aggregates |

## Scripts (workspace)

| Script | Description |
|--------|-------------|
| `npm run dev` | Nest watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Drizzle push schema to DB |
| `npm run db:seed` | Load mock seed data |
| `npm run db:generate` | Generate SQL migrations |

## Sample curls

```bash
curl http://localhost:3000/health
curl http://localhost:3000/workers
curl http://localhost:3000/workers/W-101
curl http://localhost:3000/alerts
curl -X PATCH http://localhost:3000/alerts/AL-1/acknowledge \
  -H 'Content-Type: application/json' \
  -d '{"acknowledgedBy":"Site Manager A"}'
curl http://localhost:3000/incidents
curl http://localhost:3000/stats
```
