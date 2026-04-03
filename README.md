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
| Backend | Node.js, Express |
| Data Source | Jolpica F1 API (via backend proxy) |

---

## Project Structure

```
f1-dashboard-project/
├── frontend/          # Vite + React + TypeScript app
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
└── backend/           # Express API proxy
    ├── controllers/   # f1HomeController
    ├── routes/        # f1Routes (/api/f1/*)
    ├── services/      # Jolpica API service layer
    ├── constants.js
    └── server.js
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
| GET | `/next-race` | Next race details |
| GET | `/standings/drivers` | Driver championship standings |
| GET | `/standings/constructors` | Constructor championship standings |
| GET | `/drivers` | Driver list for selector |
| GET | `/driver-stats` | Per-driver statistics |
| GET | `/driver-race-positions` | Driver positions across all races |
| GET | `/constructor-wins` | Constructor wins data |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Yarn (recommended) or npm

### 1. Clone the repo

```bash
git clone https://github.com/Skywalker9248/f1-dashboard.git
cd f1-dashboard-project
```

### 2. Setup & run the Backend

```bash
cd backend
cp .env.example .env   # set PORT (default: 5000)
yarn install
yarn dev               # starts with nodemon
```

### 3. Setup & run the Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_URL=http://localhost:5000
yarn install
yarn dev               # starts Vite dev server
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

### `backend/.env`
```env
PORT=5000
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000
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
| `yarn dev` | Start with nodemon (auto-reload) |
| `yarn start` | Start with Node |
| `yarn format` | Run Prettier on backend files |

---

## License

This project is licensed under the MIT License.

---

*Built with 💻 and a passion for Formula 1 racing.*
