# Run AltisOne ITP on Windows WITHOUT Docker
# Usage: powershell -ExecutionPolicy Bypass -File scripts\start-dev.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "=== AltisOne ITP - Windows Dev Setup ===" -ForegroundColor Cyan

# 1. Use development .env (no Docker required)
$devEnv = Join-Path $Root ".env.development"
$envFile = Join-Path $Root ".env"
if (Test-Path $devEnv) {
    Copy-Item $devEnv $envFile -Force
    Write-Host "[OK] Using .env.development (fake Redis, local MongoDB)" -ForegroundColor Green
}

# 2. Check MongoDB
$mongoRunning = $false
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("localhost", 27017)
    $tcp.Close()
    $mongoRunning = $true
} catch {}

if (-not $mongoRunning) {
    Write-Host ""
    Write-Host "[!] MongoDB is NOT running on localhost:27017" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install MongoDB Community Server (one-time):" -ForegroundColor Yellow
    Write-Host "  1. Download: https://www.mongodb.com/try/download/community" -ForegroundColor White
    Write-Host "  2. Install with 'Install MongoDB as a Service' checked" -ForegroundColor White
    Write-Host "  3. Re-run this script" -ForegroundColor White
    Write-Host ""
    Write-Host "OR use free MongoDB Atlas (cloud):" -ForegroundColor Yellow
    Write-Host "  1. Create cluster at https://www.mongodb.com/cloud/atlas" -ForegroundColor White
    Write-Host "  2. Put connection string in .env as MONGO_URI=..." -ForegroundColor White
    Write-Host ""
    exit 1
}
Write-Host "[OK] MongoDB is running" -ForegroundColor Green

# 3. Python venv + deps
$backend = Join-Path $Root "backend"
Set-Location $backend

if (-not (Test-Path ".venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}

& ".\.venv\Scripts\Activate.ps1"
pip install -q -r requirements.txt

# 4. Create admin if needed
Write-Host "Ensuring admin user exists..." -ForegroundColor Yellow
python create_admin.py 2>$null
python seed_tracks.py 2>$null

# 5. Start API
Write-Host ""
Write-Host "Starting API at http://localhost:8000" -ForegroundColor Green
Write-Host "API docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Admin login: admin@altisonelabz.com / changeme123" -ForegroundColor Green
Write-Host ""
Write-Host "In a NEW terminal, start frontend:" -ForegroundColor Cyan
Write-Host '  cd "e:\nexaltis lab\frontend"' -ForegroundColor White
Write-Host "  npx pnpm install" -ForegroundColor White
Write-Host "  npx pnpm dev:admin" -ForegroundColor White
Write-Host ""

$env:PYTHONPATH = $backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
