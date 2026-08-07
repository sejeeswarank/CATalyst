# CATalyst — Backend Developer Reference

> Flask 3 REST API providing the ML demand forecast endpoint. All other data operations go directly from the frontend to Supabase.

---

## Quick Start

```powershell
# From repo root (starts both backend + frontend)
.\start.ps1

# Or manually
.venv\Scripts\python.exe backend\app.py
```

**Port:** `http://localhost:5000`

Install dependencies (first time):

```powershell
.venv\Scripts\pip.exe install -r backend\requirements.txt
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Flask + Flask-CORS | latest |
| ML runtime | scikit-learn | 1.6.1 |
| Data wrangling | pandas | latest |
| Model persistence | joblib | latest |
| DB client | supabase-py | latest |
| SSL fix | truststore | latest |
| Config | python-dotenv | latest |
| Runtime | Python 3.x (`.venv`) | — |

> **`truststore`** is injected at startup to handle corporate HTTPS-inspection proxies that break `certifi`'s CA bundle.

---

## Environment Variables

Read from repo root `.env` via `python-dotenv`:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
Anon_public=<anon-jwt>
Service_role=<service-role-jwt>
```

The backend uses `Service_role` (full DB access, bypasses RLS).

---

## Folder Structure

```
backend/
├── app.py                     # Flask app factory — registers blueprints, CORS
├── requirements.txt           # Python dependencies
├── seed_historical_demand.py  # One-off CSV → Supabase loader for ML training data
│
├── config/
│   └── supabase_client.py     # Creates supabase client with service_role key
│
├── routes/
│   └── forecast.py            # GET /api/forecast blueprint
│
├── services/
│   └── forecast_service.py    # ML inference pipeline
│
└── utils/                     # (empty, reserved for helpers)
```

---

## API Endpoints

All responses follow a consistent envelope:

```json
{ "data": <payload or null>, "error": <string or null> }
```

### `GET /api/health`

Liveness check.

```json
{ "data": "ok", "error": null }
```

---

### `GET /api/forecast`

Returns 7-day demand predictions grouped by site and equipment type.

**Query params:**

| Param | Value | Effect |
|---|---|---|
| `persist` | `1` | Also writes predictions into `demand_forecast` table (wipes previous rows first) |

**Success (200):**

```json
{
  "data": [
    { "forecast_date": "2026-08-06", "site_id": "ST101", "equipment_type": "Excavator", "predicted_demand": 3 }
  ],
  "error": null
}
```

**Error (500):**

```json
{ "data": null, "error": "error message string" }
```

---

## ML Inference Pipeline (`services/forecast_service.py`)

The model bundle is loaded from `demand_model.joblib` at the repo root (~6.9 MB):

```python
{
  "model":        # scikit-learn Random Forest estimator
  "encoders":     # dict of {column_name: LabelEncoder}
  "feature_cols": # ordered list of feature column names
}
```

**Inference steps:**

1. **Load history** — paginated fetch of `historical_demand` (1000 rows/page) via service role key
2. **Derive site project type** — modal `project_type` per site from historical rows
3. **Build feature matrix** — cartesian product of `(forecast_day × site × equipment_type × weather)`
4. **Encode categoricals** — `LabelEncoder.transform()` per categorical column
5. **Predict** — `model.predict(frame[feature_cols])` → `predicted_demand` per row
6. **Aggregate** — group by `(forecast_date, site_id, equipment_type)`, average across weather variants, round to int
7. **Return** — serialized as list of dicts → JSON response

> Averaging across all weather classes avoids an arbitrary assumption about future weather conditions.

---

## Data Seeding

`seed_historical_demand.py` reads `historical_demand.csv` from the repo root and batch-inserts into Supabase (1000 rows/batch). Idempotent — skips if the table already has data.

```powershell
.venv\Scripts\python.exe backend\seed_historical_demand.py
```

---

## Coding Conventions

- `snake_case` for all files and variables
- One responsibility per function, keep under ~50 lines where practical
- No nested callbacks — use early returns
- One route file per feature (e.g., `routes/forecast.py`)
- Every endpoint returns `{ "data": ..., "error": null | "string" }`

---

## Known Limitations

- **No authentication** — the API is open on `localhost`. Matches hackathon scope.
- **No automated tests** — verified during development by direct browser interaction and Supabase queries.
- **No background jobs** — alert rules (idle threshold, GPS status) are seeded/simulated rather than continuously evaluated. The one live-generated alert is `Checked Out Without Booking`, raised inside the frontend's `scanTag()` mutation.
- **CORS is fully open** — all origins permitted for local dev.
