from flask import Blueprint, jsonify, request

from services.forecast_service import generate_forecast, persist_forecast

forecast_bp = Blueprint("forecast", __name__)


@forecast_bp.route("/api/forecast")
def forecast():
    try:
        records = generate_forecast()
        if request.args.get("persist") == "1":
            persist_forecast(records)
        return jsonify({"data": records, "error": None})
    except Exception as exc:
        return jsonify({"data": None, "error": str(exc)}), 500
