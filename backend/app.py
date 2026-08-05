from flask import Flask, jsonify
from flask_cors import CORS

from routes.forecast import forecast_bp

app = Flask(__name__)
CORS(app)
app.register_blueprint(forecast_bp)


@app.route("/api/health")
def health():
    return jsonify({"data": "ok", "error": None})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
