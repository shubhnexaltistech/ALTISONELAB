# Stop local dev stack (ports 8000, 3000-3003)
$ports = @(8000, 3000, 3001, 3002, 3003)
Get-Process -Name uvicorn -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
foreach ($port in $ports) {
    Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
        ForEach-Object {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        }
}
Write-Host "Stopped services on ports: $($ports -join ', ')" -ForegroundColor Green
