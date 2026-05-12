@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0update-ranked-leaderboard.ps1"
if "%1"=="--auto" exit /b
pause
