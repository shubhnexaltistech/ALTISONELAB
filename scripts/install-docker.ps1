#Requires -RunAsAdministrator
<#
.SYNOPSIS
  Install Docker Desktop and system prerequisites for AltisOne ITP on Windows.
.USAGE
  Right-click PowerShell -> Run as Administrator, then:
  powershell -ExecutionPolicy Bypass -File scripts\install-docker.ps1
#>

$ErrorActionPreference = "Stop"

function Test-Command($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

Write-Host "=== AltisOne ITP - System Setup ===" -ForegroundColor Cyan

# --- 1. Docker Desktop ---
if (Test-Command docker) {
  Write-Host "[OK] Docker already installed: $(docker --version)" -ForegroundColor Green
} else {
  Write-Host "[..] Docker not found. Installing Docker Desktop..." -ForegroundColor Yellow

  $installer = "$env:TEMP\DockerDesktopInstaller.exe"
  $dockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"

  Write-Host "Downloading Docker Desktop (~500MB)..." -ForegroundColor Yellow
  Invoke-WebRequest -Uri $dockerUrl -OutFile $installer -UseBasicParsing

  Write-Host "Running installer (this may take several minutes)..." -ForegroundColor Yellow
  Start-Process -Wait -FilePath $installer -ArgumentList "install", "--quiet", "--accept-license"

  # Add Docker to PATH for current session
  $dockerPath = "C:\Program Files\Docker\Docker\resources\bin"
  if (Test-Path $dockerPath) {
    $env:PATH = "$dockerPath;$env:PATH"
    [Environment]::SetEnvironmentVariable("PATH", "$dockerPath;" + [Environment]::GetEnvironmentVariable("PATH", "Machine"), "Machine")
  }

  Remove-Item $installer -Force -ErrorAction SilentlyContinue
  Write-Host "[OK] Docker Desktop installed. RESTART YOUR PC, then run scripts\docker-start.ps1" -ForegroundColor Green
}

# --- 2. Enable WSL2 (required by Docker) ---
if (Test-Command wsl) {
  Write-Host "[OK] WSL available" -ForegroundColor Green
} else {
  Write-Host "[..] Enabling WSL (required for Docker)..." -ForegroundColor Yellow
  dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
  dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
  Write-Host "[!] WSL enabled. Restart PC, then: wsl --install" -ForegroundColor Yellow
}

# --- 3. Node.js check ---
if (Test-Command node) {
  Write-Host "[OK] Node.js: $(node --version)" -ForegroundColor Green
} else {
  Write-Host "[!] Node.js not found. Install from https://nodejs.org/" -ForegroundColor Yellow
}

# --- 4. Python check ---
if (Test-Command python) {
  Write-Host "[OK] Python: $(python --version)" -ForegroundColor Green
} else {
  Write-Host "[!] Python not found. Install from https://python.org/" -ForegroundColor Yellow
}

# --- 5. Enable pnpm via corepack ---
if (Test-Command node) {
  Write-Host "[..] Enabling pnpm via corepack..." -ForegroundColor Yellow
  corepack enable 2>$null
  corepack prepare pnpm@9.12.0 --activate 2>$null
  if (Test-Command pnpm) {
    Write-Host "[OK] pnpm: $(pnpm --version)" -ForegroundColor Green
  } else {
    npm install -g pnpm
    Write-Host "[OK] pnpm installed globally" -ForegroundColor Green
  }
}

Write-Host ""
Write-Host "=== Setup complete ===" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Restart PC if Docker was just installed" -ForegroundColor White
Write-Host "  2. Open Docker Desktop and wait until it says 'Running'" -ForegroundColor White
Write-Host "  3. Run: powershell -ExecutionPolicy Bypass -File scripts\docker-start.ps1" -ForegroundColor White
