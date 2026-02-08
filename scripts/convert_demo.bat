@echo off
REM Quick batch script to convert the demo video to GIF

echo ========================================
echo ArtReal Video to GIF Converter
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python not found!
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Run the conversion script
python "%~dp0convert_demo_video.py"

pause
