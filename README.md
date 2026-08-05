# CATalyst — Heavy Equipment Fleet Management Platform

> A full-stack hackathon project: a CAT-branded fleet operations dashboard backed by live Supabase data, a two-step booking → RFID gate-scan rental workflow, maintenance analytics, a rule-based alert engine, and a Python ML-powered 7-day demand forecast.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Directory Structure](#directory-structure)
5. [Database Schema (Supabase)](#database-schema-supabase)
6. [Backend — Flask API](#backend--flask-api)
7. [Frontend — React SPA](#frontend--react-spa)
8. [Pages & Features](#pages--features)
9. [State Management](#state-management)
10. [ML Demand Forecast Pipeline](#ml-demand-forecast-pipeline)
11. [Rental Booking + RFID Gate Scan Workflow](#rental-booking--rfid-gate-scan-workflow)
12. [Alert Engine](#alert-engine)
13. [Design System](#design-system)
14. [Environment Variables](#environment-variables)
15. [Running Locally](#running-locally)
16. [Key Business Rules](#key-business-rules)
17. [Known Gaps / Dead Code](#known-gaps--dead-code)

---

## Project Overview

**CATalyst** is a fleet management system for heavy construction equipment (excavators, bulldozers, cranes, graders, wheel loaders, dump trucks, forklifts). Built during a hackathon, it provides:

- **Live fleet visibility** — real-time status of every machine (`Available` / `Booked` / `Running` / `Idle` / `Maintenance`) across multiple sites
- **Two-step rental workflow** — a client books a machine on the **Check Availability** page (it stays parked, marked `Booked`), and only the physical **RFID gate scan** confirms it actually left and stamps the real check-out record
- **Walk-up checkout support** — a machine can still be scanned out without a prior booking, but doing so raises a critical **"Checked Out Without Booking"** alert automatically
- **RFID gate scanning** — a simulated RFID reader UI (manual tag entry or tap-to-scan cards) that performs the exact same Supabase write a physical reader would trigger
- **Telemetry analytics** — engine hours, idle hours, fuel consumption, per-machine and per-site efficiency
- **Maintenance scheduling** — service due dates, overdue tracking, exportable CSV schedule
- **Rule-based alert engine** — critical/warning alerts for expiring/overdue rentals, idle limits, offline/GPS-lost equipment, unbooked checkouts, and more
- **AI demand forecast** — a scikit-learn model predicts per-site, per-equipment-type demand for the next 7 days
- **Real CAT equipment photography** — every vehicle type is illustrated with an actual product photo (not icons), used consistently across tables, detail pages, and page headers

The brand palette is CAT-authentic: `#FFC72C` yellow, `#101010` black, Inter + Archivo Black typography.

---

## Tech Stack

### Frontend

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 18.3 |
| Build tool | Vite | 5.4 |
| Routing | React Router DOM | 6.26 |
| Styling | Tailwind CSS | 3.4 |
| Charts | Recharts | 2.12 |
| Icons | Lucide React | 0.441 |
| DB client | @supabase/supabase-js | 2.112 |
| Utility | clsx + tailwind-merge, class-variance-authority | latest |
| PostCSS | autoprefixer | 10.4 |

### Backend

| Layer | Technology | Version |
|---|---|---|
| Framework | Flask + Flask-CORS | latest |
| ML runtime | scikit-learn | 1.6.1 |
| Data wrangling | pandas | latest |
| Model persistence | joblib | latest |
| DB client | supabase-py | latest |
| SSL fix | truststore | latest |
| Config | python-dotenv | latest |
| Env | Python 3.x (`.venv`) | — |

### Infrastructure

| Layer | Technology |
|---|---|
| Database | Supabase (PostgreSQL), Row-Level Security enabled on every table |
| Auth (DB) | Supabase service role key (backend, bypasses RLS), anon key (frontend, subject to RLS policies) |
| Hosting | Local dev only (hackathon scope) |
| ML model file | `demand_model.joblib` (~6.9 MB, committed to repo root) |

---

## Architecture

```
                     Browser (React SPA)
             Vite dev server → http://localhost:5173

  AppDataContext (React Context + useMemo/useCallback)
       │
       ├─ Supabase JS client ──────────────────────────┐
       │    (anon key, direct DB reads/writes)         │
       │                                               │
       └─ fetch() ────────────────────────────────┐    │
             GET /api/forecast                    │    │
             GET /api/health                      │    │
  ──────────────────────────────────────────────────────
                                                   │    │
              ┌────────────────────────────────────┘    │
              │  Flask backend → http://localhost:5000  │
              │                                         │
              │  routes/forecast.py                     │
              │    → services/forecast_service.py       │
              │        → joblib.load(demand_model)      │
              │        → supabase (service_role key)    │
              └─────────────────────────────────────────┘
                                         │
                            ┌────────────┴────────────┐
                            │   Supabase (PostgreSQL)  │
                            │  equipment               │
                            │  equipment_history       │
                            │  rental_history          │
                            │  alerts                  │
                            │  activity                │
                            │  sites                   │
                            │  operators               │
                            │  scan_log                │
                            │  historical_demand       │
                            │  demand_forecast          │
                            └──────────────────────────┘
```

**Key design decisions:**
- The frontend talks to Supabase **directly** for all CRUD (equipment, alerts, scans, bookings) using the anon key — no backend middleman needed for standard operations. Every table has RLS enabled with explicit `SELECT`/`INSERT` policies for the anon role.
- The backend exists **only** for the ML forecast endpoint — it loads the `.joblib` model, queries `historical_demand`, runs inference, and returns JSON.
- `truststore` is injected into Python's SSL layer at startup to handle corporate HTTPS-inspection proxies that break `certifi`'s CA bundle.

---

## Directory Structure

```
CATalyst/
├── .env                           # Supabase URL + keys (backend)
├── app.py                         # Root-level Flask health check (dev convenience, superseded by backend/app.py)
├── demand_model.joblib            # Trained scikit-learn model bundle (~6.9 MB)
├── start.ps1                      # PowerShell: start backend + frontend concurrently
├── start.sh                       # Bash equivalent of start.ps1
│
├── backend/
│   ├── app.py                     # Flask app factory — registers blueprints, CORS
│   ├── requirements.txt           # Python dependencies
│   ├── seed_historical_demand.py  # One-off CSV → Supabase loader for ML training data
│   ├── backend.md                 # Hackathon backend reference notes
│   │
│   ├── config/
│   │   └── supabase_client.py     # Creates supabase client with service_role key
│   │
│   ├── routes/
│   │   └── forecast.py            # GET /api/forecast Blueprint
│   │
│   ├── services/
│   │   └── forecast_service.py    # ML inference pipeline
│   │
│   └── utils/                     # (empty, reserved for helpers)
│
└── frontend/
    ├── index.html                 # Vite entrypoint, favicon link
    ├── package.json                # NPM config & all dependencies
    ├── tailwind.config.js          # CAT brand color tokens, fonts, animations
    ├── vite.config.js              # Path alias @ → ./src
    ├── postcss.config.js
    │
    ├── public/
    │   ├── favicon.svg             # CAT yellow triangle mark
    │   ├── hero-equipment.png      # Wide equipment photo used in every page header
    │   └── vehicles/               # Real CAT product photography, one per vehicle type
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
        ├── App.jsx                 # All route definitions (9 routes)
        ├── index.css               # Global resets
        │
        ├── lib/
        │   ├── supabase.js         # Supabase JS client (anon key)
        │   └── utils.js            # cn(), formatDate(), daysBetween(), timeAgo(), downloadCSV()
        │
        ├── data/
        │   ├── supabaseData.js     # fetchAllData() — 7 parallel queries + normalization
        │   └── mockData.js         # Static mock dataset — dead code, not imported anywhere
        │
        ├── state/
        │   └── AppDataContext.jsx  # Central React context: fleet state + all selectors + mutations
        │
        ├── styles/
        │   ├── tokens.css          # CSS custom properties (colors, typography, motion)
        │   └── components.css     # Base component styles
        │
        ├── pages/
        │   ├── Dashboard.jsx           # /                KPI tiles + charts + table
        │   ├── EquipmentDetails.jsx    # /equipment/:id   Per-machine deep dive
        │   ├── CheckAvailability.jsx   # /availability    Booking search + confirm
        │   ├── Alerts.jsx              # /alerts          Rental + equipment alerts
        │   ├── Analytics.jsx           # /analytics       Maintenance schedule + CSV
        │   ├── MachineryUsage.jsx      # /machinery-usage Site telemetry + charts
        │   ├── ScanEquipment.jsx       # /scan            RFID scan simulation
        │   └── Settings.jsx            # /settings        Site + operator onboarding
        │
        └── components/
            ├── DemandForecastPanel.jsx     # /forecast   ML forecast UI
            ├── Badge.jsx, Button.jsx, Card.jsx, Input.jsx, Modal.jsx,
            │   Navbar.jsx, StatTile.jsx, TextArea.jsx     # Legacy top-level components — dead code, unused
            │
            ├── common/
            │   ├── PageHero.jsx           # Eyebrow + title + subtitle header, optional bgImage w/ gradient fade
            │   ├── SeverityBadge.jsx      # Critical / Warning / Info badge
            │   ├── StatusBadge.jsx        # Available / Booked / Running / Idle / Maintenance
            │   ├── VehicleIcon.jsx        # Renders the real CAT photo for a given vehicle type
            │   └── ExcavatorGraphic.jsx   # Decorative SVG — dead code, unused
            │
            ├── dashboard/
            │   ├── KpiCard.jsx            # Metric tile with icon + tone
            │   ├── AssetTable.jsx         # Filterable, paginated equipment table w/ vehicle image column
            │   ├── AlertsMiniTable.jsx    # Compact alert list w/ vehicle image column
            │   ├── ActivityTimeline.jsx   # Event timeline
            │   ├── NewOperatorForm.jsx    # Add operator inline form
            │   └── charts/
            │       ├── UtilizationPieChart.jsx        # Status breakdown
            │       ├── RentalDistributionPieChart.jsx # Rentals by vehicle type
            │       ├── FuelTrendChart.jsx              # Fuel + engine hours (7-day)
            │       ├── DowntimeBySiteChart.jsx         # Idle + maintenance bar chart
            │       ├── EngineHoursBarChart.jsx         # Top 10 by engine hours
            │       └── IdleHoursBarChart.jsx           # Top 10 by idle hours
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

---

## Database Schema (Supabase)

All 10 tables have Row-Level Security **enabled**, each with `SELECT` and `INSERT` policies permitting the `anon` role (`USING (true)` / `WITH CHECK (true)`) — necessary because the frontend writes directly to Supabase with no backend in between.

### `equipment` — 50 rows

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | e.g. `EQX1001` |
| `type` | text | Excavator, Bulldozer, Crane, Grader, Wheel Loader, Dump Truck, Forklift |
| `site_id` | text FK → sites | |
| `status` | text | `Available`, `Booked`, `Running`, `Idle`, `Maintenance` |
| `is_rented` | boolean | |
| `operator_id` | text FK → operators | nullable |
| `rented_by` | text | client company name |
| `check_out_date` | date | |
| `check_in_date` | date | expected/actual return date |
| `daily_rate` | numeric | USD/day |
| `rfid_tag` | text | e.g. `RFID-CF9E2A`, auto-generated `'RFID-' + 6-char hex` |
| `engine_hours_today` | numeric | |
| `idle_hours_today` | numeric | |
| `is_offline` | boolean | GPS/telemetry offline flag |
| `gps_lost` | boolean | |
| `last_returned_late` | boolean | |
| `last_service_date` | date | |
| `next_service_due` | date | |
| `maintenance_reason` | text | nullable |
| `pending_client` | text | staged renter name from booking, promoted to `rented_by` on departure scan |
| `pending_operator_id` | text | staged operator from booking, promoted to `operator_id` on departure scan |
| `pending_return_date` | date | staged return date from booking, promoted to `check_in_date` on departure scan |

### `equipment_history` — 350 rows (7 days × 50 units)

| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `equipment_id` | text FK → equipment | |
| `date` | date | |
| `engine_hours` | numeric | |
| `idle_hours` | numeric | |
| `fuel_usage` | numeric | litres |
| `location` | text | |

### `rental_history` — 150 rows

| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `equipment_id` | text FK | |
| `client` | text | |
| `operator_name` | text | |
| `start_date` | date | |
| `end_date` | date | |

### `alerts` — 42 rows

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | e.g. `AL0004` or, for scan-generated alerts, `AL-SCAN-<equipmentId>-<timestamp>` |
| `equipment_id` | text FK | |
| `type` | text | `Rental Overdue`, `Rental Expiring Tomorrow`, `Idle Time Exceeded Allowed Limit`, `Machine Offline`, `Machine Running without Operator`, `Maintenance Due`, `GPS Signal Lost (Simulation)`, `Machine Returned Late`, `Checked Out Without Booking` |
| `severity` | text | `critical`, `warning` |
| `status` | text | `Active`, `Resolved` |
| `timestamp` | timestamptz | |

> The `alerts` table's `INSERT` RLS policy was missing for a period during development — every scan-generated alert was silently rejected (401 / error 42501) until it was added. Confirmed fixed by inserting a test alert directly and verifying it landed.

### `activity` — 14 rows

| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `kind` | text | `checkin`, `returned`, `engine-start`, `idle-alert`, etc. |
| `text` | text | Human-readable event description |
| `timestamp` | timestamptz | |

### `sites` — 10 rows

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | e.g. `ST101` |
| `name` | text | |
| `region` | text | North Region, South Region, East Region, West Region |

### `operators` — 20 rows

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | e.g. `OP101` |
| `name` | text | |
| `email` | text | |
| `phone` | text | |
| `location` | text | |

### `scan_log` — 22 rows (audit trail)

| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `tag_id` | text | RFID tag string as scanned |
| `equipment_id` | text | nullable — unknown tags have no match |
| `action` | text | `check_out`, `check_in`, `rejected` |
| `site_id` | text | |
| `reason` | text | rejection reason (nullable), e.g. `"Unknown tag"`, `"Equipment in maintenance"` |
| `scanned_at` | timestamptz | auto-set by DB |

### `historical_demand` — 13,140 rows (ML training data)

| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `site_id` | text | |
| `equipment_type` | text | |
| `project_type` | text | |
| `weather` | text | |
| `date` | date | |
| `demand` | int | actual units demanded that day |

### `demand_forecast` — 0 rows (ML output, optional persistence)

| Column | Type | Notes |
|---|---|---|
| `forecast_date` | date | |
| `site_id` | text | |
| `equipment_type` | text | |
| `predicted_demand` | int | |

Only populated if the forecast endpoint is called with `?persist=1`.

---

## Backend — Flask API

**Entry point:** `backend/app.py`
**Port:** `5000`
**CORS:** open (all origins for local dev)

### `GET /api/health`

```json
{ "data": "ok", "error": null }
```

Liveness check.

---

### `GET /api/forecast`

Returns 7-day demand predictions by site and equipment type.

**Query params:**

| Param | Value | Effect |
|---|---|---|
| `persist` | `1` | Also writes predictions into `demand_forecast` table (wipes previous rows first) |

**Success response:**

```json
{
  "data": [
    { "forecast_date": "2026-08-06", "site_id": "ST101", "equipment_type": "Excavator", "predicted_demand": 3 }
  ],
  "error": null
}
```

**Error response (500):**

```json
{ "data": null, "error": "error message string" }
```

---

## Frontend — React SPA

**Entry:** `frontend/src/main.jsx`

```jsx
<BrowserRouter>
  <AppDataProvider>
    <App />
  </AppDataProvider>
</BrowserRouter>
```

### Route Table

| Path | Component | Description |
|---|---|---|
| `/` | `Dashboard` | Fleet overview KPIs, charts, full equipment table |
| `/equipment/:id` | `EquipmentDetails` | Per-machine profile, daily usage, rental history |
| `/availability` | `CheckAvailability` | Filter + book available machines |
| `/alerts` | `Alerts` | Rental and equipment alert management |
| `/analytics` | `Analytics` | Maintenance schedule, overdue tracker, CSV export |
| `/forecast` | `DemandForecastPanel` | 7-day ML forecast per site |
| `/machinery-usage` | `MachineryUsage` | Site-level telemetry, fuel/downtime charts |
| `/scan` | `ScanEquipment` | RFID scan simulation + recent scan log |
| `/settings` | `Settings` | Site and operator onboarding |

All routes render inside `AppLayout`, which wraps content with `Header` (top nav + global search + alert bell). The header has no user/account button — the app is single-tenant for this hackathon build.

---

## Pages & Features

### Dashboard (`/`)

- **8 KPI tiles:** Total Equipment, Currently Rented, Available, Running, Idle, Rental Expiring Soon, Maintenance Required, Active Operators
- **Fleet Utilization pie chart** — Running / Idle / Available / Maintenance status breakdown
- **Rentals by Vehicle Type pie chart** — which machine categories are most rented
- **Recent Activity timeline** — latest events from the `activity` table
- **Equipment Fleet table** — filterable + paginated (10 per page), searchable via URL `?q=` param, includes a vehicle photo column, row links to individual equipment page
- Page header shows the equipment hero photo with a gradient fade on the right

### Equipment Details (`/equipment/:id`)

- Machine identity card with a large (320×320px) real vehicle photo, no background box — just the photo on a plain card
- Info grid: site, operator, rented-by, rental window, daily rate, engine + idle hours today, total rented hours
- Daily usage table (last 7 days): engine hours, idle hours, fuel usage (L), location
- Rental history table: client, operator, start/end dates
- Usage history activity timeline

### Check Availability (`/availability`)

- Filter form: rental start date, duration (days), vehicle type, site, region
- Shows only `status = 'Available'` machines (`Booked`/`Running`/`Idle`/`Maintenance` excluded — a machine can't be double-booked)
- Booking modal: client name (required), operator assignment (optional), cost estimate (daily rate × duration)
- On confirm → sets `status = 'Booked'`, `is_rented = true`, and writes `pending_client` / `pending_operator_id` / `pending_return_date` — but does **not** set `check_out_date` or `operator_id` yet
- Confirmation dialog explains the machine stays in the garage until the gate RFID scan confirms departure

### Alerts (`/alerts`)

- Summary KPIs: total, critical, warning, resolved counts
- Toggle between **Rental Alerts** (expiring tomorrow / overdue — shows a "Rented By" column and a "Send Alert" email-simulation button) and **Equipment Alerts** (anomaly alerts — idle limit, offline, maintenance due, unbooked checkout, etc.)
- Both tables include a vehicle photo column
- Alert table columns: alert type, equipment + vehicle type, vehicle photo, site, [rented by], reported (relative time), status

### Analytics (`/analytics`)

- **4 maintenance KPIs:** In Maintenance Now, Overdue Service, Due This Week, Avg Days Since Service
- Full maintenance schedule table sorted by urgency (soonest due first), includes a vehicle photo column
- Days Until Due: red badge = overdue (shows `Xd overdue`), plain text = due within the week
- **Export CSV** downloads `catalyst-maintenance-schedule.csv`
- Page header shows the equipment hero photo with gradient fade

### Demand Forecast (`/forecast`)

- Calls `GET http://localhost:5000/api/forecast`
- Groups results by `site_id`, renders one card per site
- Equipment types ranked by total 7-day predicted demand; top entry highlighted in black + CAT yellow
- Loading spinner, error state with retry button and `python app.py` setup instructions

### Machinery Usage (`/machinery-usage`)

- Fleet-level KPIs: total sites, deployed fleet, engine hours today, fleet efficiency %
- **Fuel Usage & Engine Hours** line chart (7-day fleet-wide aggregate from `equipment_history`)
- **Downtime by Site** stacked bar chart (idle hours + assumed 8h per machine in Maintenance)
- **Site usage cards** — click-to-filter the telemetry table; shows efficiency %, engine/idle hours, active vs total units
- **Equipment Telemetry table** — filter by site/status/search query; columns include engine hours, idle hours, efficiency progress bar; row links to detail page

### Scan Equipment (`/scan`)

- **Manual input field** — type or paste an RFID tag ID; mimics a physical reader's keyboard-wedge output
- **Equipment tag grid** — every machine shown with its simulated RFID tag; button label adapts to status:
  - `Booked` → **"Confirm Departure"**
  - `Available` → **"Tap to Scan"**
  - `Maintenance` → **"In Maintenance"** (disabled)
- Booked cards show the staged booking details: *"Booked for [client] · Expected return [date] · Operator [id]"*
- RFID scan plays a 1800 Hz square-wave beep via the Web Audio API (120ms) to mimic a real reader's confirmation tone
- 700ms artificial delay renders a "Scanning…" state for demo realism
- Toast after a scan is color-coded: normal check-out/check-in is black/yellow, a rejected scan is red, and an unbooked-checkout alert is also flagged red with an `AlertTriangle` icon even though the checkout itself succeeded
- **Recent Scans** list — last 10 entries from `scan_log` with action labels and relative time

### Settings (`/settings`)

- **Sites table** — all sites with ID and location
- **Add Site dialog** — enter name, auto-generates random `ST###` ID
- **Operators table** — all operators with ID, name, email, phone, location
- **Add Operator form** — inserts into `operators` table and updates local React state

---

## State Management

All fleet state lives in `AppDataContext` (`frontend/src/state/AppDataContext.jsx`).

### Initialization

On mount, calls `fetchAllData()` (in `frontend/src/data/supabaseData.js`), which fires **7 parallel Supabase queries**:

```
equipment (joined to sites)  |  equipment_history  |  rental_history
alerts  |  activity  |  sites  |  operators
```

Raw snake_case DB rows are normalized into camelCase JS objects with computed fields:
- `rentalDaysLeft` — days until `check_in_date`
- `daysUntilService` — days until `next_service_due`

### Derived Selectors (all `useCallback`-memoized)

| Selector | Returns |
|---|---|
| `getKpis()` | Fleet-level status counts |
| `getEquipmentById(id)` | Single machine lookup |
| `getAlertKpis()` | Alert severity counts |
| `getRentalAlerts()` | Alerts of type Rental Expiring / Overdue |
| `getEquipmentAlerts()` | All non-rental alerts (includes unbooked-checkout alerts) |
| `getMaintenanceKpis()` | Maintenance workload counts |
| `getMaintenanceSchedule()` | Equipment sorted by service urgency |
| `getUtilizationBreakdown()` | Pie chart data (status breakdown) |
| `getEngineHoursTop(n)` | Top N machines by engine hours today |
| `getIdleHoursTop(n)` | Top N machines by idle hours today |
| `getRentalDistributionByType()` | Pie chart data (rentals by type) |
| `getFuelTrend()` | Fleet-wide fuel + engine hours by day |
| `getDowntimeBySite()` | Idle + maintenance downtime per site |

### Mutations (write-through to Supabase + optimistic local update)

| Mutation | What it does |
|---|---|
| `addSite(name)` | Inserts into `sites`, generates random 3-digit `ST###` ID |
| `addOperator({name, email, phone, location})` | Inserts into `operators`, generates sequential `OP###` ID |
| `bookEquipment(id, {client, operatorId, expectedReturn})` | Rejects if machine isn't `Available`; sets `status=Booked`, writes `pending_*` columns |
| `scanTag(tagId)` | Full RFID gate state machine — see workflow section below |
| `getRecentScans(limit)` | Async fetch of the last N rows from `scan_log`, newest first |

### Constants

```js
VEHICLE_TYPES              = ['Excavator', 'Bulldozer', 'Crane', 'Grader', 'Wheel Loader', 'Dump Truck', 'Forklift']
REGIONS                    = ['North Region', 'South Region', 'East Region', 'West Region']
IDLE_LIMIT_HOURS           = 4   // threshold for idle alerts
MAINTENANCE_DOWNTIME_HOURS = 8   // assumed lost hours per Maintenance machine per day
```

---

## ML Demand Forecast Pipeline

### Model Bundle (`demand_model.joblib`)

A Python dict loaded by `joblib.load()`:

```python
{
  "model":        # scikit-learn estimator (Random Forest)
  "encoders":     # dict of {column_name: LabelEncoder} for categoricals
  "feature_cols": # ordered list of feature column names for model.predict()
}
```

Trained offline on `historical_demand` rows (13,140 rows across 10 sites). Committed to the repo root (~6.9 MB).

### Inference Steps (`backend/services/forecast_service.py`)

1. **Load history** — paginated fetch of `historical_demand` (1000 rows/page) via service role key
2. **Derive site project type** — for each site, take the modal `project_type` from historical rows
3. **Build feature matrix** — cartesian product of `(forecast_day × site × equipment_type × weather)`:
   - `forecast_date` — ISO date string
   - `site_id`, `equipment_type`, `project_type`, `weather`
   - `day` — short weekday name (Mon–Sun)
   - `is_weekend` — 0 or 1
4. **Encode categoricals** — apply `LabelEncoder.transform()` to each categorical column
5. **Predict** — `model.predict(frame[feature_cols])` → `predicted_demand` per row
6. **Aggregate** — group by `(forecast_date, site_id, equipment_type)`, average across all weather variants, round to int
7. **Return** — serialized as list of dicts → JSON response

**Why average across weather?** Future weather is unknowable; averaging across all weather classes prevents an arbitrary assumption from skewing predictions.

### Data Seeding

`backend/seed_historical_demand.py` reads `historical_demand.csv` from the repo root and batch-inserts into Supabase (1000 rows/batch). Idempotent — skips if the table already has data.

---

## Rental Booking + RFID Gate Scan Workflow

This is the core interaction the app was redesigned around: **you book in the app, the RFID scan is what actually confirms the machine left.**

```
Step 1 — Check Availability (/availability)
  ├─ Filter by type / site / region → only status='Available' shown
  ├─ Booking modal: client name, operator (optional), expected return date
  └─ bookEquipment() called
       → Supabase UPDATE equipment SET
           status='Booked', is_rented=true,
           pending_client, pending_operator_id, pending_return_date
       → React state updated optimistically
       (check_out_date, operator_id, rented_by are NOT set yet)

Step 2 — Machine sits in the garage as "Booked"
  ├─ Invisible in future availability searches (status != Available)
  └─ Shows "Confirm Departure" button on /scan, with the staged booking
     details visible on its card

Step 3 — Gate Scan (/scan)
  ├─ Operator scans the RFID tag at the site gate (or types it manually)
  └─ scanTag(tagId):
       │
       ├─ Tag not found by rfid_tag
       │     → scan_log: rejected, reason "Unknown tag"
       │
       ├─ Equipment status = Maintenance
       │     → scan_log: rejected, reason "Equipment in maintenance"
       │
       ├─ Equipment status = Booked  (pre-booked departure)
       │     → status: Booked → Running
       │     → promote pending_client      → rented_by
       │     → promote pending_operator_id → operator_id
       │     → promote pending_return_date → check_in_date
       │     → set check_out_date = today
       │     → clear all pending_* columns
       │     → scan_log: check_out
       │
       ├─ Equipment status = Available  (walk-up checkout, no booking)
       │     → status: Available → Running
       │     → set check_out_date = today, check_in_date = null
       │     → scan_log: check_out
       │     → ⚠ ALSO inserts a critical "Checked Out Without Booking"
       │       alert (see Alert Engine below) — this is the only path
       │       that raises this alert
       │
       └─ Equipment status = Running / Idle  (return)
             → status → Available
             → set check_in_date = today
             → clear operator_id + rented_by
             → scan_log: check_in

Step 4 — Return
  Same "Running / Idle" branch above — machine scanned back in at the
  gate returns to Available and stops being billed against that renter.
```

The UI plays a **1800 Hz square-wave beep** (120ms, via Web Audio API) on every scan attempt to mimic a real RFID reader's confirmation tone, and shows a 700ms "Scanning…" animation before resolving.

---

## Alert Engine

Two categories of alerts live in the same `alerts` table, split for display by whether their `type` is rental-clock-related:

**Rental Alerts** (`Rental Overdue`, `Rental Expiring Tomorrow`) — shown with a "Rented By" column and a "Send Alert" (simulated email) action button on the Alerts page.

**Equipment Alerts** (everything else) — anomaly-style alerts:
- `Idle Time Exceeded Allowed Limit`
- `Machine Offline`
- `Machine Running without Operator`
- `Maintenance Due`
- `GPS Signal Lost (Simulation)`
- `Machine Returned Late`
- **`Checked Out Without Booking`** — the newest rule, raised automatically inside `scanTag()` whenever a machine is scanned out from `Available` status rather than `Booked`. This is the enforcement mechanism behind "you're supposed to book before it leaves" — skip the booking step and the system still lets the machine out, but flags it as critical immediately: on the Alerts page, in the header notification bell count, and via a red toast on the Scan Equipment page itself.

Most of these alerts are seeded/simulated for the hackathon demo rather than derived from live telemetry rules (no background job currently evaluates idle time or GPS status continuously) — the one alert type that **is** live-generated from real user action is `Checked Out Without Booking`.

---

## Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `cat-yellow` | `#FFC72C` | Primary accent, CTA buttons, highlights, favicon |
| `cat-yellow-dark` | `#E6B325` | Hover states |
| `cat-black` | `#101010` | Primary text, card headers |
| `cat-ink` | `#1A1A1A` | Secondary dark |
| `cat-charcoal` | `#232326` | Dark surfaces |
| `cat-slate` | `#3A3A3E` | Muted / secondary text |
| `border` | `#E5E5E7` | Dividers, table borders |
| `background` | `#F7F7F8` | Page background, inset panels |
| `success` | `#16A34A` | Available, operational states |
| `warning` | `#F59E0B` | Idle, expiring soon |
| `danger` | `#DC2626` | Maintenance, critical alerts |
| `info` | `#2563EB` | Informational states |

### Typography

| Role | Family |
|---|---|
| Display (headings, IDs, KPIs) | Archivo Black → Anton → sans-serif |
| Body | Inter → system-ui → sans-serif |

### Motion

| Token | Value | Usage |
|---|---|---|
| `animate-fade-in` | `opacity 0→1 + translateY(4px→0)`, 200ms ease-out | Toast notifications |
| `animate-pulse` | Tailwind built-in | Scanning RFID icon |
| `--ease-mech` | `cubic-bezier(0.65, 0, 0.35, 1)` | Button press effects |
| `--duration-fast` | `150ms` | Micro-interactions |
| `--duration-med` | `300ms` | Panel transitions |

### Component Conventions

- Cards: `rounded-2xl` (1.25rem), `shadow-card`
- Inner panels / inputs: `rounded-xl` (0.875rem)
- Status badges: dot indicator + colored text, one color per status state (`Booked` uses a yellow badge)
- KPI cards use `tone` prop: `default`, `yellow`, `info`, `success`, `warning`, `danger`
- Every page header (`PageHero`) shows the CAT equipment hero photo bled in from the right edge, masked with a `linear-gradient` so it fades to transparent rather than cutting off sharply
- Vehicle photos (`VehicleIcon`) are real product photography, not icons — one JPEG per `VEHICLE_TYPES` entry, rendered at consistent sizes: 88×88px in tables, 320×320px on the equipment detail page

### Favicon

`public/favicon.svg` — the yellow CAT triangle mark, referenced from `index.html` via `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`.

---

## Environment Variables

### Root `.env` (read by Flask backend via `python-dotenv`)

```env
SUPABASE_URL=https://<project-ref>.supabase.co
Anon_public=<anon-jwt>
Service_role=<service-role-jwt>
```

The backend uses `Service_role` (full DB access, bypasses RLS) loaded from the repo root `.env`.

### `frontend/.env` (read by Vite at build time)

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-jwt>
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` defaults to `http://localhost:5000` inside `DemandForecastPanel.jsx` if the env var is absent.

---

## Running Locally

### Prerequisites

- Node.js 18+
- Python 3.10+ with a `.venv` virtualenv at the repo root

### One-command start (PowerShell)

```powershell
.\start.ps1
```

Starts:
- Flask backend on **http://localhost:5000** (using `.venv\Scripts\python.exe`)
- Vite dev server on **http://localhost:5173**

Both share a single terminal session. Ctrl+C stops both cleanly (the `finally` block kills the backend process).

### Manual start

**Backend:**
```powershell
.venv\Scripts\python.exe backend\app.py
```

**Frontend:**
```powershell
cd frontend
npm install      # first time only
npm run dev
```

### Install Python dependencies (first time)

```powershell
.venv\Scripts\pip.exe install -r backend\requirements.txt
```

### Seed ML training data (one-off)

Place `historical_demand.csv` in the repo root, then:

```powershell
.venv\Scripts\python.exe backend\seed_historical_demand.py
```

Idempotent — skips if the `historical_demand` table already has rows.

### Building the frontend

```powershell
cd frontend
npm run build
```

Outputs to `frontend/dist`. Current build produces a single ~933 KB JS bundle (~257 KB gzipped) — Vite warns about chunk size since the app hasn't been code-split, which is an acceptable tradeoff at hackathon scope.

---

## Key Business Rules

| Rule | Where enforced |
|---|---|
| Only `Available` machines can be booked | `bookEquipment()` rejects any other status |
| Booked machines are excluded from availability search | `CheckAvailability` filters `status !== 'Available'` |
| A departure scan on a `Booked` machine promotes its `pending_*` fields into the real rental record | `isBookedDeparture` branch in `scanTag()` |
| Walk-up checkout (no prior booking) is still allowed | `isCheckingOut && !isBookedDeparture` branch in `scanTag()` |
| A walk-up checkout raises a critical alert | Same branch also inserts into `alerts` with type `Checked Out Without Booking` |
| Maintenance machines cannot be scanned out | `scanTag()` rejects with a logged reason |
| Every scan attempt is logged, including rejections | All branches of `scanTag()` insert a `scan_log` row |
| Idle threshold is 4 hours | `IDLE_LIMIT_HOURS = 4` |
| Maintenance downtime is assumed at 8h per machine per day | `MAINTENANCE_DOWNTIME_HOURS = 8`, used in the downtime chart |
| Forecast averages across all weather classes | Avoids an arbitrary single-weather assumption |
| Forecast horizon is exactly 7 days | `HORIZON_DAYS = 7` in `forecast_service.py` |
| Sites get auto-generated 3-digit IDs | `ST` + random 3-digit number |
| Operators get sequential IDs | `OP` + (max existing numeric suffix + 1) |
| Every Supabase table needs an explicit RLS `INSERT` policy for the anon role, or writes fail silently with a 401 | Learned the hard way — the `alerts` table shipped with only a `SELECT` policy, so every scan-generated alert failed until the `INSERT` policy was added |

---

## Known Gaps / Dead Code

- `frontend/src/data/mockData.js` — a full static mock dataset, never imported anywhere. Superseded entirely by live Supabase data via `supabaseData.js`.
- `frontend/src/components/common/ExcavatorGraphic.jsx` — a decorative `<img>` wrapper referencing `/excavator.jpg`, unused since `VehicleIcon.jsx` replaced it with real per-type photography.
- `frontend/src/components/{Badge,Button,Card,Input,Modal,Navbar,StatTile,TextArea}.jsx` — an earlier, unstyled component set at the top level of `components/`, fully superseded by the `components/ui/` versions. None are imported anywhere.
- Most `alerts` rows (idle limit, offline, GPS lost, etc.) are seeded/simulated rather than continuously computed by a live rule engine — there's no background job re-evaluating telemetry thresholds. `Checked Out Without Booking` is the one alert type genuinely generated by live user action (a real gate scan).
- The app has no authentication or multi-tenant support — it's single-session, matching the hackathon's scope. The header's user/account button was removed rather than wired up.
- No automated test suite (unit or e2e) exists for either the frontend or backend — verification during development was done by direct browser interaction and Supabase queries.

---

*Built at the Caterpillar Hackathon, August 2026.*
