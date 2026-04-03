# F1 Dashboard 🏎️

A full-stack Formula 1 dashboard for visualizing live standings, race results, driver stats, and upcoming race schedules — built as a hobby project for F1 fans.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| UI Library | MUI (Material UI v7) |
| Charts | Apache ECharts (`echarts-for-react`) |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Styling | MUI theming + Styled Components |
| Backend | Hono on Cloudflare Workers |
| Caching | Cloudflare Cache API (edge caching) |
| Data Sources | OpenF1 API, Jolpica API, Open-Meteo |

---

## Project Structure

```
f1-dashboard-project/
├── frontend/          # Vite + React + TypeScript app (deployed on Vercel)
│   ├── src/
│   │   ├── components/
│   │   │   ├── tabs/          # LastRace, NextRace, OverallStandings tabs
│   │   │   │   └── standings/ # Driver & Constructor charts and tables
│   │   │   ├── widgets/       # ScheduleWidget, WeatherWidget
│   │   │   ├── Navbar.tsx
│   │   │   ├── LoadingUI.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── context/           # ThemeContext (light/dark mode)
│   │   ├── hooks/             # useDataFetch custom hook
│   │   ├── pages/             # Home page
│   │   ├── types/             # Shared TypeScript types
│   │   ├── utils/             # Utility helpers
│   │   ├── axios.ts           # Axios instance with base URL
│   │   └── constants.ts
│   └── helpers/               # Frontend build helpers
│
└── backend/           # Hono API (deployed on Cloudflare Workers)
    ├── src/
    │   ├── index.js            # Hono entry point
    │   ├── routes/
    │   │   └── f1Routes.js
    │   ├── controllers/
    │   │   └── f1HomeController.js
    │   └── services/
    │       └── f1Service.js
    ├── constants.js
    └── wrangler.toml
```

---

## Features

- 🏁 **Last Race Results** — Final classification with positions, points, and fastest lap
- 📅 **Next Race** — Upcoming Grand Prix info with circuit and session schedule
- 🏆 **Driver Standings** — Points chart, race positions chart, grid position chart, DNF chart, and standings table
- 🏗️ **Constructor Standings** — Points chart, wins chart, and standings table
- 🗓️ **Schedule Widget** — Full season race calendar
- 🌤️ **Weather Widget** — Race weekend weather overview
- 🌗 **Light / Dark Mode** — Theme toggle via MUI theming

---

## API Endpoints

All routes are prefixed with `/api/f1`:

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/last-race` | Last race results |
| GET | `/next-race` | Next race details + weather forecast |
| GET | `/standings/drivers` | Driver championship standings |
| GET | `/standings/constructors` | Constructor championship standings |
| GET | `/drivers` | Driver list for selector |
| GET | `/driver-stats` | Per-driver statistics (DNFs, avg grid position) |
| GET | `/driver-race-positions` | Driver positions across all races |
| GET | `/constructor-wins` | Constructor wins data |
| GET | `/home` | Alias for `/last-race` (legacy) |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Yarn (recommended) or npm
- A [Cloudflare account](https://dash.cloudflare.com) (free tier is fine)

### 1. Clone the repo

```bash
git clone https://github.com/Skywalker9248/f1-dashboard.git
cd f1-dashboard-project
```

### 2. Setup & run the Backend

```bash
cd backend
yarn install
yarn start    # runs wrangler dev on http://localhost:8787
```

### 3. Setup & run the Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_URL=http://localhost:8787
yarn install
yarn dev               # starts Vite dev server
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

### `frontend/.env`
```env
VITE_API_URL=http://localhost:8787
```

No backend `.env` needed — Cloudflare Workers uses `wrangler.toml` for configuration.

---

## Deployment

### Backend — Cloudflare Workers

```bash
cd backend

# First time only: create the KV namespace and fill the IDs into wrangler.toml
npx wrangler kv namespace create "F1_CACHE"
npx wrangler kv namespace create "F1_CACHE" --preview

# Deploy
yarn deploy
```

### Frontend — Vercel

Push to `main` — Vercel auto-deploys. Set the `VITE_API_URL` environment variable in your Vercel project settings to your deployed Workers URL:

```
VITE_API_URL=https://f1-dashboard-api.<your-subdomain>.workers.dev
```

---

## Scripts

### Frontend (`frontend/`)
| Command | Description |
|---------|-------------|
| `yarn dev` | Start Vite dev server |
| `yarn build` | TypeScript check + production build |
| `yarn preview` | Preview production build |
| `yarn lint` | Run ESLint |
| `yarn format` | Run Prettier on `src/` |

### Backend (`backend/`)
| Command | Description |
|---------|-------------|
| `yarn start` | Start Wrangler dev server |
| `yarn deploy` | Deploy to Cloudflare Workers |
| `yarn format` | Run Prettier on backend files |

---

## License

This project is licensed under the MIT License.

---

*Built with 💻 and a passion for Formula 1 racing.*
