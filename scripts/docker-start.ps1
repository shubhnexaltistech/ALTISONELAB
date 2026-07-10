# Start full AltisOne ITP stack with Docker
# Usage: powershell -ExecutionPolicy Bypass -File scripts\docker-start.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "=== AltisOne ITP - Docker Start ===" -ForegroundColor Cyan

# Check Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host "[ERROR] Docker not found." -ForegroundColor Red
  Write-Host "Run as Administrator: powershell -ExecutionPolicy Bypass -File scripts\install-docker.ps1" -ForegroundColor Yellow
  exit 1
}

# Ensure Docker daemon is running
try {
  docker info 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Docker not running" }
} catch {
  Write-Host "[ERROR] Docker Desktop is not running." -ForegroundColor Red
  Write-Host "Open Docker Desktop from Start Menu and wait until it is ready." -ForegroundColor Yellow
  exit 1
}
Write-Host "[OK] Docker is running" -ForegroundColor Green

# Setup .env for Docker
if (-not (Test-Path ".env") -or (Select-String -Path ".env" -Pattern "mongodb:27017" -Quiet) -eq $false) {
  Copy-Item ".env.docker" ".env" -Force
  Write-Host "[OK] Created .env from .env.docker" -ForegroundColor Green
}

# Build frontend if dist missing
$needsBuild = @("landing", "admin", "lms", "mentor") | Where-Object {
  -not (Test-Path "frontend\apps\$_\dist\index.html")
}
if ($needsBuild.Count -gt 0) {
  Write-Host "[..] Building frontend apps..." -ForegroundColor Yellow
  Set-Location "$Root\frontend"
  if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm install
    pnpm build:all
  } else {
    npx pnpm install
    npx pnpm build:all
  }
  Set-Location $Root
  Write-Host "[OK] Frontend built" -ForegroundColor Green
}

# Ensure uploads dir
New-Item -ItemType Directory -Force -Path "uploads" | Out-Null

# Start services (dev mode: API exposed on 8000, no nginx)
Write-Host "[..] Starting Docker services..." -ForegroundColor Yellow
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERROR] docker compose failed" -ForegroundColor Red
  exit 1
}

Write-Host "[..] Waiting for API health..." -ForegroundColor Yellow
$retries = 30
for ($i = 0; $i -lt $retries; $i++) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 3
    if ($r.StatusCode -eq 200) { break }
  } catch { Start-Sleep -Seconds 3 }
}

# Create admin user
Write-Host "[..] Creating admin user..." -ForegroundColor Yellow
docker compose exec -T api python create_admin.py 2>$null

Write-Host "[..] Seeding tracks..." -ForegroundColor Yellow
docker compose exec -T api python seed_tracks.py 2>$null

Write-Host ""
Write-Host "=== Stack is running ===" -ForegroundColor Green
Write-Host "  API docs:    http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Health:      http://localhost:8000/health" -ForegroundColor White
Write-Host "  Admin login: admin@altisonelabz.com / changeme123" -ForegroundColor White
Write-Host ""
Write-Host "Start frontend (new terminal):" -ForegroundColor Cyan
Write-Host '  cd frontend' -ForegroundColor White
Write-Host "  npx pnpm dev:admin    # http://localhost:3001" -ForegroundColor White
Write-Host "  npx pnpm dev:landing  # http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Stop stack:  powershell -File scripts\docker-stop.ps1" -ForegroundColor Gray
