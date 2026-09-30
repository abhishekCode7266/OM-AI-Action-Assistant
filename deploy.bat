@echo off
setlocal
echo =====================================================
echo    OM - AI Action Assistant ^| One-Click Deploy
echo    Tagline: 'Think. Plan. Act. Achieve.'
echo =====================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1" %*
