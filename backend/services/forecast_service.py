import os
from datetime import date, timedelta

import joblib
import pandas as pd

from config.supabase_client import supabase

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(ROOT, "demand_model.joblib")

_bundle = joblib.load(MODEL_PATH)
_model = _bundle["model"]
_encoders = _bundle["encoders"]
_feature_cols = _bundle["feature_cols"]

PAGE = 1000
HORIZON_DAYS = 7


def _load_history():
    rows = []
    start = 0
    while True:
        page = (
            supabase.table("historical_demand")
            .select("site_id, equipment_type, project_type, weather")
            .range(start, start + PAGE - 1)
            .execute()
        )
        rows.extend(page.data)
        if len(page.data) < PAGE:
            return pd.DataFrame(rows)
        start += PAGE


def _mode(series, fallback):
    counts = series.value_counts()
    return counts.index[0] if len(counts) else fallback


def generate_forecast():
    """Predict per-site, per-equipment demand for the next 7 days.

    Future weather is unknowable, so predictions are averaged across every
    weather class the model was trained on rather than guessing one.
    """
    history = _load_history()
    if history.empty:
        return []

    site_project = {
        site: _mode(group["project_type"], _encoders["project_type"].classes_[0])
        for site, group in history.groupby("site_id")
    }

    sites = sorted(site_project)
    equipment_types = sorted(history["equipment_type"].unique())
    weathers = list(_encoders["weather"].classes_)
    today = date.today()

    rows = []
    for offset in range(1, HORIZON_DAYS + 1):
        day = today + timedelta(days=offset)
        day_name = day.strftime("%a")
        is_weekend = int(day_name in ("Sat", "Sun"))
        for site in sites:
            for equipment_type in equipment_types:
                for weather in weathers:
                    rows.append(
                        {
                            "forecast_date": day.isoformat(),
                            "site_id": site,
                            "equipment_type": equipment_type,
                            "project_type": site_project[site],
                            "weather": weather,
                            "day": day_name,
                            "is_weekend": is_weekend,
                        }
                    )

    frame = pd.DataFrame(rows)
    for column, encoder in _encoders.items():
        frame[f"{column}_enc"] = encoder.transform(frame[column])

    frame["predicted_demand"] = _model.predict(frame[_feature_cols])

    daily = (
        frame.groupby(["forecast_date", "site_id", "equipment_type"], as_index=False)["predicted_demand"]
        .mean()
        .round()
        .astype({"predicted_demand": int})
    )

    return daily.to_dict(orient="records")


def persist_forecast(records):
    supabase.table("demand_forecast").delete().neq("site_id", "").execute()
    if records:
        supabase.table("demand_forecast").insert(records).execute()
