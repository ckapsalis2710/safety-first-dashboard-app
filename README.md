# 🦺 SafetyFirst Dashboard

**SafetyFirst Dashboard** is an interactive web application for construction site safety supervision. It provides real-time worker monitoring, PPE (Personal Protective Equipment) compliance analysis, incident detection, and personalized improvement recommendations using data from robots (Unitree), wearable sensors, and incident logs.

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

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | TypeScript compilation + production build (output: `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Lint code with ESLint |

---

## 📁 Project Structure

```
safetyfirstdashboard/
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

