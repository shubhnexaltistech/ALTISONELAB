# Full production stack including nginx
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host "Docker not installed. Run scripts\install-docker.ps1 first." -ForegroundColor Red
  exit 1
}

Copy-Item ".env.docker" ".env" -Force -ErrorAction SilentlyContinue

# Build frontend
Set-Location "$Root\frontend"
if (Get-Command pnpm -ErrorAction SilentlyContinue) { pnpm build:all } else { npx pnpm build:all }
Set-Location $Root

Write-Host "Starting production stack (with nginx on port 80)..." -ForegroundColor Cyan
docker compose --profile production up -d --build

Write-Host "Running at http://localhost (nginx)" -ForegroundColor Green
