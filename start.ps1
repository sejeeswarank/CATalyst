# Starts both the Flask backend and the Vite frontend for local dev.
# Usage (from the project root, in PowerShell):
#   .\start.ps1

$root = $PSScriptRoot

Write-Host "Starting backend on http://localhost:5000 ..."
$backend = Start-Process -PassThru -NoNewWindow `
  -FilePath "$root\.venv\Scripts\python.exe" `
  -ArgumentList "app.py" `
  -WorkingDirectory "$root\backend"

try {
    Write-Host "Starting frontend on http://localhost:5173 ..."
    Push-Location "$root\frontend"
    npm run dev
}
finally {
    Pop-Location
    Write-Host "Stopping backend (pid $($backend.Id))..."
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
}
