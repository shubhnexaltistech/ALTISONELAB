# Start full AltisOne ITP stack for local development (no Docker)
# Usage: powershell -ExecutionPolicy Bypass -File scripts\start-all-dev.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "=== AltisOne ITP - Full Dev Stack ===" -ForegroundColor Cyan

# --- Backend setup ---
$devEnv = Join-Path $Root ".env.development"
if (Test-Path $devEnv) {
    Copy-Item $devEnv (Join-Path $Root ".env") -Force
    Write-Host "[OK] Using .env.development" -ForegroundColor Green
}

$mongoRunning = $false
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("localhost", 27017)
    $tcp.Close()
    $mongoRunning = $true
} catch {}

if (-not $mongoRunning) {
    Write-Host "[ERROR] MongoDB not running on localhost:27017" -ForegroundColor Red
    Write-Host "Install MongoDB Community or start Docker Desktop and run scripts\docker-start.ps1" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] MongoDB is running" -ForegroundColor Green

$backend = Join-Path $Root "backend"
if (-not (Test-Path (Join-Path $backend ".venv"))) {
    Set-Location $backend
    python -m venv .venv
    Set-Location $Root
}
& (Join-Path $backend ".venv\Scripts\pip.exe") install -q -r (Join-Path $backend "requirements.txt") | Out-Null

# --- Frontend env ---
$frontendEnv = Join-Path $Root "frontend\.env"
if (-not (Test-Path $frontendEnv)) {
    Copy-Item (Join-Path $Root "frontend\.env.example") $frontendEnv
    Write-Host "[OK] Created frontend/.env" -ForegroundColor Green
}

# --- Start backend ---
$backendPort = 8000
$existing = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "[OK] Backend already on port $backendPort" -ForegroundColor Green
} else {
    Write-Host "[..] Starting backend on port $backendPort..." -ForegroundColor Yellow
    $backendCmd = @"
Set-Location '$backend'
& '.\.venv\Scripts\Activate.ps1'
`$env:PYTHONPATH = '$backend'
python create_admin.py 2>`$null
python seed_tracks.py 2>`$null
uvicorn app.main:app --host 127.0.0.1 --port $backendPort
"@
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Minimized
}

# --- Start all frontend apps ---
$apps = @(
    @{ Name = "landing"; Port = 3000; Script = "dev:landing" },
    @{ Name = "admin";   Port = 3001; Script = "dev:admin" },
    @{ Name = "lms";     Port = 3002; Script = "dev:lms" },
    @{ Name = "mentor";  Port = 3003; Script = "dev:mentor" }
)

$frontend = Join-Path $Root "frontend"
foreach ($app in $apps) {
    $port = $app.Port
    $existing = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "[OK] $($app.Name) already on port $port" -ForegroundColor Green
        continue
    }
    Write-Host "[..] Starting $($app.Name) on port $port..." -ForegroundColor Yellow
    $feCmd = "Set-Location '$frontend'; npx pnpm $($app.Script)"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $feCmd -WindowStyle Minimized
}

Write-Host ""
Write-Host "[..] Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 12

$urls = @(
    @{ Label = "API docs";    Url = "http://localhost:8000/docs" },
    @{ Label = "Landing";     Url = "http://localhost:3000" },
    @{ Label = "Admin";       Url = "http://localhost:3001" },
    @{ Label = "LMS";         Url = "http://localhost:3002" },
    @{ Label = "Mentor";      Url = "http://localhost:3003" }
)

Write-Host ""
Write-Host "=== Stack URLs ===" -ForegroundColor Green
foreach ($u in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $u.Url -UseBasicParsing -TimeoutSec 5
        Write-Host "  [UP]   $($u.Label): $($u.Url)" -ForegroundColor Green
    } catch {
        Write-Host "  [WAIT] $($u.Label): $($u.Url)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Admin login: admin@altisonelabz.com / changeme123" -ForegroundColor Cyan
Write-Host "Stop all:    powershell -File scripts\stop-all-dev.ps1" -ForegroundColor Gray
Write-Host "Deploy:      powershell -File scripts\deploy.ps1" -ForegroundColor Gray
