import logging

from flask import Blueprint, jsonify, request

from services.forecast_service import generate_forecast, persist_forecast

forecast_bp = Blueprint("forecast", __name__)
log = logging.getLogger(__name__)


@forecast_bp.route("/api/forecast")
def forecast():
    try:
        records = generate_forecast()
        if request.args.get("persist") == "1":
            persist_forecast(records)
        return jsonify({"data": records, "error": None})
    except Exception:
        # Log the full traceback server-side; return a generic message so we
        # don't leak file paths, table names, or driver internals to the client.
        log.exception("forecast generation failed")
        return jsonify({"data": None, "error": "Forecast temporarily unavailable."}), 500
