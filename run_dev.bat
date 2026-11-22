@echo off
echo ====================================================
echo   Starting RELOOP Platform (Backend + Frontend)
echo ====================================================

REM Ensure Node.js is on PATH
SET "PATH=C:\Users\ridhi\AppData\Local\Programs\nodejs;%PATH%"

REM Initialize database if not exists
cd /d "%~dp0backend"
python seed.py

REM Start FastAPI Backend in background
echo [1/2] Starting Python FastAPI Backend on port 8000...
start "RELOOP Backend" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

REM Start Next.js Frontend
echo [2/2] Starting Next.js App on port 3000...
cd /d "%~dp0frontend"
npm run dev

pause
