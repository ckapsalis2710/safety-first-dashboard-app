# 🦺 SafetyFirst Dashboard

**SafetyFirst Dashboard** is an interactive web application for construction site safety supervision. It provides real-time worker monitoring, PPE (Personal Protective Equipment) compliance analysis, incident detection, and personalized improvement recommendations using data from robots (Unitree), wearable sensors, and incident logs.

## 🌐 Live Demo & Source

- **Live demo:** <https://safety-first-dashboard-app.vercel.app/>
- **Repository:** <https://github.com/ckapsalis2710/safety-first-dashboard-app>

---

## ✨ Features

| Page | Description |
|------|-------------|
| **Dashboard** | KPI cards (worker count, PPE compliance, active alerts), worker table with search/filter, worker details (PPE status, heart rate trend), alerts panel with severity/worker filtering |
| **Workers** | 30-day compliance trend (line chart), biometrics (heart rate, fatigue), incidents & violations log per worker |
| **Role Analysis** | Compliance rate comparison by role (horizontal bar chart), top violations per role, detailed statistics table |
| **Sites** | Site summary with KPI cards, 6-month compliance trend (line chart), risk zone map with site markers, risk zones |
| **Incidents** | Monthly incident trend (bubble chart), distribution by shift hour (bar chart), top incident conditions, incident log |
| **Robot Unitree** | Simulated camera live feed, robot status (battery, connection, mode, temperature, gas), sorted detection list, patrol route |
| **Recommendations** | Personalized PPE recommendations per worker (based on actual PPE gaps), send/acknowledge recommendations, data sources overview |
| **Loading Skeletons:** | Enhances user experience with smooth loading states across all pages (Dashboard, Sites, Robot, etc.), indicating when data is being fetched |

---

## 🛠️ Tech Stack

| Technology | Usage |
|------------|-------|
| **React 19** | UI library |
| **TypeScript 6** | Static typing |
| **Vite 8** | Build tool & dev server |
| **MUI 9** (Material UI) | UI components & theming (light/dark) |
| **React Router 7** | SPA routing |
| **Recharts 3** | Charts (Bar, Line) |
| **Emotion 11** | CSS-in-JS styling |
| **NestJS 11** | Backend API (`apps/api`) |
| **Drizzle ORM** | PostgreSQL schema & queries |
| **PostgreSQL 16** | Primary database (Docker Compose) |

---

## 🏗️ Architecture

This repository is an **npm workspaces monorepo** (NestJS full-stack migration — step 1 API).

| Package | Path | Role |
|---------|------|------|
| `@safety-first/web` | `apps/web` | React + Vite frontend (current dashboard UI) |
| `@safety-first/api` | `apps/api` | NestJS + Drizzle + PostgreSQL REST API |
| `@safety-first/shared` | `packages/shared` | Shared TypeScript types used by web (and later by the API) |

**Monorepo note:** Install once at the repo root (`npm install`). Use root scripts `dev:web`, `dev:api`, `db:up`, `db:seed`, etc., or run workspace commands with `-w @safety-first/web` / `-w @safety-first/api`.

## 🚀 Installation & Usage

```bash
# 1. Install dependencies (from repo root — npm workspaces)
npm install

# 2. Start Postgres (Docker)
cp .env.example .env   # if you do not already have .env
npm run db:up
npm run db:push        # create/sync Drizzle schema
npm run db:seed        # load mock workers/alerts/incidents

# 3. Start the API (Nest watch mode) — http://localhost:3000
npm run dev:api

# 4. Start the web app (hot-reload) — http://localhost:5173
npm run dev:web
```

Web: **http://localhost:5173** · API: **http://localhost:3000** · Postgres: `localhost:5432` (user/pass/db: `safety` / `safety` / `safety_first`).

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:web` | Start Vite dev server for `@safety-first/web` |
| `npm run build:web` | TypeScript + production build for the web app |
| `npm run dev:api` | Start NestJS API in watch mode |
| `npm run build:api` | Compile the API to `apps/api/dist` |
| `npm run typecheck:api` | Typecheck the API |
| `npm run db:up` | `docker compose up -d postgres` |
| `npm run db:down` | Stop compose services |
| `npm run db:push` | Push Drizzle schema to Postgres |
| `npm run db:seed` | Seed DB from mock data (web mock equivalent) |
| `npm run lint` | Lint the web app with ESLint |
| `npm run preview -w @safety-first/web` | Preview production build locally |

---

## 📁 Project Structure

```
safety-first-dashboard-app/
├── package.json                 # workspaces root (apps/*, packages/*)
├── apps/
│   ├── web/                     # React + Vite frontend (@safety-first/web)
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── package.json
│   │   ├── public/
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── types/index.ts   # thin re-export from @safety-first/shared
│   │       ├── theme/
│   │       ├── data/
│   │       ├── components/
│   │       ├── domain/
│   │       ├── hooks/
│   │       └── pages/
│   └── api/                     # NestJS + Drizzle API (@safety-first/api)
├── packages/
│   └── shared/                  # Shared types (@safety-first/shared)
│       └── src/index.ts
├── docker-compose.yml           # Postgres (+ optional redis profile)
└── .env.example                 # DATABASE_URL, PORT
```

### API endpoints (step 1)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/workers` | List workers |
| GET | `/workers/:id` | Worker detail |
| GET | `/alerts` | List alerts |
| PATCH | `/alerts/:id/acknowledge` | Acknowledge an alert |
| GET | `/incidents` | List incidents |
| GET | `/stats` | Dashboard aggregates |

---

## 🌗 Theme

Supports **Light** and **Dark** mode. Toggle via the sun/moon icon in the page header.

---

## 📊 Data Sources

The app uses **mock data** for demonstration. The simulated data sources include:

| Source | Description |
|--------|-------------|
| **Robot Unitree** | PPE violation detection, obstacle detection, unauthorized entry detection |
| **Wearable Sensors** | Heart rate, fatigue level, battery status, connection status |
| **Incident Logs** | Incident records with environmental conditions (weather, temperature, humidity, lighting) |
| **AI Analysis Engine** | Compliance score calculation, trends, personalized recommendations |

---

## 🧪 Production Roadmap

- Wire frontend TanStack Query to the Nest API (step 2)
- Add authentication & authorization
- Unit & integration tests (Vitest + React Testing Library / Nest testing)
- WebSocket for real-time updates
- Full Docker Compose (API + web + postgres)
- CI/CD pipeline

