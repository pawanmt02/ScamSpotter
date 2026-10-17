Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Starting Scam Spotter (Team P K)        " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

# Start FastAPI Backend in background job
Write-Host "[1/2] Launching FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD/backend
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
}

Start-Sleep -Seconds 2

# Start Vite Frontend
Write-Host "[2/2] Launching Vite Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Set-Location frontend
npm run dev
