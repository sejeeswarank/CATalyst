#!/usr/bin/env bash
# Starts both the Flask backend and the Vite frontend for local dev.
# Usage: bash start.sh   (from the project root)
set -e

cd "$(dirname "$0")"

echo "Starting backend on http://localhost:5000 ..."
(cd backend && "../.venv/Scripts/python.exe" app.py) &
BACKEND_PID=$!

cleanup() {
  echo "Stopping backend (pid $BACKEND_PID)..."
  kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT

echo "Starting frontend on http://localhost:5173 ..."
(cd frontend && npm run dev)
