@echo off
echo ==========================================
echo   Starting Scam Spotter (Team P K)
echo ==========================================

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "Scam Spotter Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Vite Frontend on http://localhost:5173 ...
cd frontend && npm run dev
