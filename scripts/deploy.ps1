# Production deployment via Docker Compose
# Usage: powershell -ExecutionPolicy Bypass -File scripts\deploy.ps1
#
# Prerequisites:
#   1. Docker Desktop running
#   2. .env configured with production secrets (copy from .env.example)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "=== AltisOne ITP - Production Deploy ===" -ForegroundColor Cyan

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Docker not installed. Run scripts\install-docker.ps1" -ForegroundColor Red
    exit 1
}

try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Docker not running" }
} catch {
    Write-Host "[ERROR] Docker Desktop is not running." -ForegroundColor Red
    Write-Host "Open Docker Desktop and wait until it shows 'Running', then re-run this script." -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Docker is running" -ForegroundColor Green

if (-not (Test-Path ".env")) {
    Write-Host "[ERROR] Missing .env file. Copy .env.example to .env and set production secrets." -ForegroundColor Red
    exit 1
}

$secretKey = Select-String -Path ".env" -Pattern "^SECRET_KEY=(change-me|dev-)" -Quiet
if ($secretKey) {
    Write-Host "[WARN] SECRET_KEY still has default value — update .env before real production deploy." -ForegroundColor Yellow
}

# Build frontend
Write-Host "[..] Building frontend apps..." -ForegroundColor Yellow
Set-Location "$Root\frontend"
if (-not (Test-Path ".env.production")) {
    @"
VITE_API_URL=http://localhost/api
VITE_LANDING_URL=http://localhost
VITE_ADMIN_URL=http://localhost/admin
VITE_LMS_URL=http://localhost/lms
VITE_MENTOR_URL=http://localhost/mentor
"@ | Set-Content ".env.production"
}
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm install
    pnpm build:all
} else {
    npx pnpm install
    npx pnpm build:all
}
Set-Location $Root
Write-Host "[OK] Frontend built" -ForegroundColor Green

New-Item -ItemType Directory -Force -Path "uploads" | Out-Null

Write-Host "[..] Starting production stack (nginx + api + mongo + redis + celery)..." -ForegroundColor Yellow
docker compose --profile production up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] docker compose failed" -ForegroundColor Red
    exit 1
}

Write-Host "[..] Waiting for API..." -ForegroundColor Yellow
for ($i = 0; $i -lt 30; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing -TimeoutSec 3
        if ($r.StatusCode -eq 200) { break }
    } catch { Start-Sleep -Seconds 3 }
}

Write-Host "[..] Creating admin user..." -ForegroundColor Yellow
docker compose exec -T api python create_admin.py 2>$null

Write-Host ""
Write-Host "=== Deployed ===" -ForegroundColor Green
Write-Host "  Landing:  http://localhost" -ForegroundColor White
Write-Host "  Admin:    http://localhost/admin" -ForegroundColor White
Write-Host "  LMS:      http://localhost/lms" -ForegroundColor White
Write-Host "  Mentor:   http://localhost/mentor" -ForegroundColor White
Write-Host "  API docs: http://localhost/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "Admin login: admin@altisonelabz.com / changeme123" -ForegroundColor Cyan
Write-Host "Stop: docker compose --profile production down" -ForegroundColor Gray
