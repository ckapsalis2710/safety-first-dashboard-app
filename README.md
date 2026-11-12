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

---

## 🚀 Installation & Usage

```bash
# 1. Install dependencies
npm install

# 2. Start development server (hot-reload)
npm run dev
```

The app will be available at **http://localhost:5173**.

### Local PostgreSQL

The Alerts API still runs in memory. PostgreSQL is optional for running the current app and is used here to verify the database connection.

```bash
docker compose up -d --wait db
cp .env.example .env.server.local
npm run db:check
```

In PowerShell, use `Copy-Item .env.example .env.server.local` in place of `cp`. The database is bound to `127.0.0.1:5433`; the example credentials are for local use only.

The named `postgres-data` volume stores both `safetyfirst_dev` and `safetyfirst_test`. The PostgreSQL image creates the development database and runs `docker/postgres/init-test-db.sql` to create the test database on first initialization. Existing volumes are preserved. If you already have an initialized volume without the test database, create it once with:

```bash
docker compose exec -T db psql -U safetyfirst -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE safetyfirst_test"
```

To check the separate test database, copy `.env.example` to `.env.server.test.local`, change the database name at the end of `DATABASE_URL` to `safetyfirst_test`, and run:

```bash
node --env-file=.env.server.test.local server/db/check.ts
```

These files are ignored by Git and loaded by Node for the check. An already exported `DATABASE_URL` takes precedence; clear it before checking the database specified by an environment file. Keep the URL on the server and never give it a `VITE_` prefix. The databases share the local server and credentials but have separate data and schemas. Existing HTTP tests still use in-memory alerts.

Use `docker compose stop db` to stop PostgreSQL while retaining the volume. Neither Express startup nor `db:check` applies migrations or resets data. `drizzle.config.ts` reserves the schema and migration paths for the next step and reads `DATABASE_URL` from its process environment.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | TypeScript compilation + production build (output: `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Lint code with ESLint |
| `npm run db:check` | Run `SELECT 1` against the server-only `DATABASE_URL` |

---

## 📁 Project Structure

```
safety-first-dashboard-app/
├── index.html
├── package.json
├── vite.config.ts
├── eslint.config.js
├── public/
└── src/
    ├── main.tsx                 # Entry point
    ├── App.tsx                  # Routing & ThemeProvider
    ├── index.css                # Global styles & Inter font
    ├── types/index.ts           # TypeScript types
    ├── theme/theme.ts           # MUI theme (light/dark)
    ├── data/
    │   ├── mockData.ts          # Mock data
    │   └── enrichedData.ts      # Data helpers
    ├── components/
    │   ├── common/
    │   │   ├── Layout/Layout.tsx
    │   │   ├── Layout/Sidebar.tsx
    │   │   ├── PageHeader.tsx
    │   │   └── NotificationMenu.tsx
    │   └── dashboard/
    │       └── WorkerDetails.tsx
    └── pages/
        ├── Dashboard.tsx
        ├── WorkerHistoryPage.tsx
        ├── RoleAnalysisPage.tsx
        ├── SitesPage.tsx
        ├── IncidentsPage.tsx
        ├── RobotPage.tsx
        └── RecommendationsPage.tsx
```

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

- Replace mock data with real API calls (REST / GraphQL)
- Add authentication & authorization
- Unit & integration tests (Vitest + React Testing Library)
- WebSocket for real-time updates
- Docker containerization
- CI/CD pipeline

