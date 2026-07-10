# Stop AltisOne ITP Docker stack
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "Stopping Docker services..." -ForegroundColor Yellow
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
Write-Host "Done." -ForegroundColor Green
