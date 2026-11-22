# RELOOP Single-Command Dev Runner
$env:PATH = "C:\Users\ridhi\AppData\Local\Programs\nodejs;" + $env:PATH
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "====================================================" -ForegroundColor Green
Write-Host "  Starting RELOOP Circular Economy Platform" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green

# Reseed database
Write-Host "[1/3] Checking & initializing SQLite database..." -ForegroundColor Cyan
Set-Location "$rootDir\backend"
python seed.py

# Launch FastAPI backend
Write-Host "[2/3] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

# Launch Next.js frontend
Write-Host "[3/3] Launching Next.js Frontend on http://localhost:3000..." -ForegroundColor Cyan
Set-Location "$rootDir\frontend"
npm run dev
