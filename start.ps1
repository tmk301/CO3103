# Start script for both frontend and backend
# Usage: .\start.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting CO3103 Job Finder App" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"

# Start Backend
Write-Host "[Backend] Starting Django server..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "python" -ArgumentList "start.py" -WorkingDirectory $backendDir -PassThru -NoNewWindow

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[Frontend] Starting Vite dev server..." -ForegroundColor Green
$frontendProcess = Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run dev" -WorkingDirectory $frontendDir -PassThru -NoNewWindow

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Both servers are starting!" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:8386" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Red

# Wait for user to press Ctrl+C
try {
    Wait-Process -Id $backendProcess.Id, $frontendProcess.Id
} finally {
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Red
    
    # Stop both processes
    if (!$backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if (!$frontendProcess.HasExited) {
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "Servers stopped." -ForegroundColor Red
}
