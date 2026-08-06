# CATalyst — Frontend Developer Reference

> React 18 + Vite 5 SPA backed by Supabase. CAT-branded fleet management dashboard.

---

## Quick Start

```powershell
# From repo root (starts both backend + frontend)
.\start.ps1

# Or manually
cd frontend
npm install      # first time only
npm run dev      # http://localhost:5173
```

Build for production:

```powershell
cd frontend
npm run build    # outputs to frontend/dist
```

> The production bundle is ~933 KB JS (~257 KB gzipped). No code-splitting applied — acceptable at hackathon scope.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 18.3 |
| Build tool | Vite | 5.4 |
| Routing | React Router DOM | 6.26 |
| Styling | Tailwind CSS | 3.4 |
| Charts | Recharts | 2.12 |
| Icons | Lucide React | 0.441 |
| DB client | @supabase/supabase-js | 2.112 |
| Utilities | clsx, tailwind-merge, class-variance-authority | latest |

---

## Environment Variables

Create `frontend/.env` (copy from `frontend/.env.example`):

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-jwt>
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` defaults to `http://localhost:5000` in `DemandForecastPanel.jsx` if the variable is absent.

---

## Folder Structure

```
frontend/
├── index.html                  # Vite entrypoint, favicon link
├── package.json
├── tailwind.config.js          # CAT brand color tokens, fonts, animations
├── vite.config.js              # Path alias @ → ./src
├── postcss.config.js
│
├── public/
│   ├── favicon.svg             # CAT yellow triangle mark
│   ├── hero-equipment.png      # Wide photo used in every PageHero header
│   └── vehicles/               # Real CAT product photography (one per type)
│       ├── excavator.jpg
│       ├── bulldozer.jpg
│       ├── crane.jpg
│       ├── grader.jpg
│       ├── wheel-loader.jpg
│       ├── dump-truck.jpg
│       └── forklift.jpg
│
└── src/
    ├── main.jsx                # React root: BrowserRouter + AppDataProvider
    ├── App.jsx                 # Route definitions (9 routes inside AppLayout)
    ├── index.css               # Global resets
    │
    ├── lib/
    │   ├── supabase.js         # Supabase JS client (anon key)
    │   └── utils.js            # cn(), formatDate(), daysBetween(), timeAgo(), downloadCSV()
    │
    ├── data/
    │   ├── supabaseData.js     # fetchAllData() — 7 parallel queries + normalization
    │   └── mockData.js         # ⚠ Dead code — not imported anywhere
    │
    ├── state/
    │   └── AppDataContext.jsx  # Central context: fleet state + selectors + mutations
    │
    ├── styles/
    │   ├── tokens.css          # CSS custom properties (colors, typography, motion)
    │   └── components.css      # Base component styles
    │
    ├── pages/
    │   ├── Dashboard.jsx           # /                 KPI tiles + charts + fleet table
    │   ├── EquipmentDetails.jsx    # /equipment/:id    Per-machine deep dive
    │   ├── CheckAvailability.jsx   # /availability     Booking search + confirm
    │   ├── Alerts.jsx              # /alerts           Rental + equipment alerts
    │   ├── Analytics.jsx           # /analytics        Maintenance schedule + CSV export
    │   ├── MachineryUsage.jsx      # /machinery-usage  Site telemetry + charts
    │   ├── ScanEquipment.jsx       # /scan             RFID scan simulation
    │   └── Settings.jsx            # /settings         Site + operator onboarding
    │
    └── components/
        ├── DemandForecastPanel.jsx     # /forecast   ML forecast UI
        │
        ├── common/
        │   ├── PageHero.jsx           # Eyebrow + title + subtitle, optional hero image w/ gradient fade
        │   ├── SeverityBadge.jsx      # Critical / Warning / Info badge
        │   ├── StatusBadge.jsx        # Available / Booked / Running / Idle / Maintenance
        │   ├── VehicleIcon.jsx        # Renders real CAT photo for a given vehicle type
        │   └── ExcavatorGraphic.jsx   # ⚠ Dead code — unused decorative SVG
        │
        ├── dashboard/
        │   ├── KpiCard.jsx                # Metric tile with icon + tone prop
        │   ├── AssetTable.jsx             # Filterable, paginated equipment table
        │   ├── AlertsMiniTable.jsx        # Compact alert list w/ vehicle image column
        │   ├── ActivityTimeline.jsx       # Event timeline from activity table
        │   ├── NewOperatorForm.jsx        # Inline add-operator form
        │   └── charts/
        │       ├── UtilizationPieChart.jsx
        │       ├── RentalDistributionPieChart.jsx
        │       ├── FuelTrendChart.jsx
        │       ├── DowntimeBySiteChart.jsx
        │       ├── EngineHoursBarChart.jsx
        │       └── IdleHoursBarChart.jsx
        │
        ├── layout/
        │   ├── AppLayout.jsx          # Outlet wrapper (shared layout shell)
        │   └── Header.jsx             # Top nav, global search, alert bell dropdown
        │
        └── ui/
            ├── badge.jsx, button.jsx, card.jsx
            ├── dialog.jsx, input.jsx, select.jsx
            └── table.jsx
```

> **Dead code at top-level `components/`:** `Badge`, `Button`, `Card`, `Input`, `Modal`, `Navbar`, `StatTile`, `TextArea` — superseded by `components/ui/`. Not imported anywhere.

---

## Route Table

| Path | Component | Description |
|---|---|---|
| `/` | `Dashboard` | Fleet KPIs, charts, full equipment table |
| `/equipment/:id` | `EquipmentDetails` | Per-machine profile, daily usage, rental history |
| `/availability` | `CheckAvailability` | Filter + book available machines |
| `/alerts` | `Alerts` | Rental and equipment alert management |
| `/analytics` | `Analytics` | Maintenance schedule, overdue tracker, CSV export |
| `/forecast` | `DemandForecastPanel` | 7-day ML forecast per site |
| `/machinery-usage` | `MachineryUsage` | Site-level telemetry, fuel/downtime charts |
| `/scan` | `ScanEquipment` | RFID scan simulation + recent scan log |
| `/settings` | `Settings` | Site and operator onboarding |

All routes render inside `AppLayout`, which wraps content with `Header`.

---

## State Management

All fleet state lives in `AppDataContext` (`src/state/AppDataContext.jsx`).

### Initialization

On mount, `fetchAllData()` fires **7 parallel Supabase queries**:

```
equipment (joined to sites) | equipment_history | rental_history
alerts | activity | sites | operators
```

Raw DB rows are normalized to camelCase with computed fields:
- `rentalDaysLeft` — days until `check_in_date`
- `daysUntilService` — days until `next_service_due`

### Selectors (all `useCallback`-memoized)

| Selector | Returns |
|---|---|
| `getKpis()` | Fleet-level status counts |
| `getEquipmentById(id)` | Single machine lookup |
| `getAlertKpis()` | Alert severity counts |
| `getRentalAlerts()` | Rental Expiring / Overdue alerts |
| `getEquipmentAlerts()` | All non-rental alerts |
| `getMaintenanceKpis()` | Maintenance workload counts |
| `getMaintenanceSchedule()` | Equipment sorted by service urgency |
| `getUtilizationBreakdown()` | Pie chart data (status breakdown) |
| `getEngineHoursTop(n)` | Top N by engine hours today |
| `getIdleHoursTop(n)` | Top N by idle hours today |
| `getRentalDistributionByType()` | Pie chart data (rentals by type) |
| `getFuelTrend()` | Fleet-wide fuel + engine hours by day |
| `getDowntimeBySite()` | Idle + maintenance downtime per site |

### Mutations (write-through to Supabase + optimistic local update)

| Mutation | What it does |
|---|---|
| `addSite(name)` | Inserts into `sites`, generates random `ST###` ID |
| `addOperator({name, email, phone, location})` | Inserts into `operators`, generates sequential `OP###` ID |
| `bookEquipment(id, {...})` | Rejects if not `Available`; sets `status=Booked`, writes `pending_*` columns |
| `scanTag(tagId)` | Full RFID gate state machine (see main README) |
| `getRecentScans(limit)` | Async fetch of last N rows from `scan_log` |

---

## Design System

### Color Tokens (`tailwind.config.js`)

| Token | Hex | Usage |
|---|---|---|
| `cat-yellow` | `#FFC72C` | Primary accent, CTA buttons, highlights |
| `cat-yellow-dark` | `#E6B325` | Hover states |
| `cat-black` | `#101010` | Primary text, card headers |
| `cat-charcoal` | `#232326` | Dark surfaces |
| `cat-slate` | `#3A3A3E` | Muted / secondary text |
| `success` | `#16A34A` | Available, operational |
| `warning` | `#F59E0B` | Idle, expiring soon |
| `danger` | `#DC2626` | Maintenance, critical alerts |
| `info` | `#2563EB` | Informational states |

### Typography

| Role | Family |
|---|---|
| Display (headings, IDs, KPIs) | Archivo Black → Anton → sans-serif |
| Body | Inter → system-ui → sans-serif |

### Motion

| Token | Value |
|---|---|
| `animate-fade-in` | opacity 0→1 + translateY(4px→0), 200ms ease-out |
| `--ease-mech` | `cubic-bezier(0.65, 0, 0.35, 1)` |
| `--duration-fast` | `150ms` |
| `--duration-med` | `300ms` |

### Component Conventions

- Cards: `rounded-2xl`, `shadow-card`
- Inner panels / inputs: `rounded-xl`
- Status badges: dot indicator + colored text per state
- KPI cards use `tone` prop: `default | yellow | info | success | warning | danger`
- **`PageHero`** — each page header shows the CAT hero photo bleeding in from the right, masked with a `linear-gradient` fade to transparent
- **`VehicleIcon`** — real product photography, 88×88px in tables, 320×320px on the equipment detail page

---

## Coding Conventions

- PascalCase components, camelCase variables/functions
- One component per file
- Tailwind utility classes for layout; design tokens for colors/type
- No inline `style={}` objects
- No animation libraries — CSS transitions only (`:hover`, `:active`)
- Controlled inputs: `value` + `onChange(newValue)` pattern
