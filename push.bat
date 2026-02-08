@echo off
REM ArtReal Push Script for Windows
REM Usage: push.bat "commit message"

cd /d "%~dp0"

if "%~1"=="" (
    echo Usage: push.bat "commit message"
    exit /b 1
)

git add .
git commit -m "%~1"
git push origin main

echo.
echo ✅ Pushed successfully!
