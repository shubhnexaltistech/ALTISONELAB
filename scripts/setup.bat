@echo off
REM AltisOne ITP - One-click Docker setup for Windows
REM Double-click or run: scripts\setup.bat

echo === AltisOne ITP Setup ===

where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker not found. Installing...
    powershell -ExecutionPolicy Bypass -File "%~dp0install-docker.ps1"
    echo.
    echo Please RESTART your PC, open Docker Desktop, then run this script again.
    pause
    exit /b 0
)

powershell -ExecutionPolicy Bypass -File "%~dp0docker-start.ps1"
pause
