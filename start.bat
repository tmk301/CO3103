@echo off
REM Start script for both frontend and backend
REM Usage: double-click start.bat or run from command line

echo ========================================
echo   Starting CO3103 Job Finder App
echo ========================================
echo.

cd /d "%~dp0"

echo [Backend] Starting Django server in new window...
start "Backend - Django" cmd /k "cd backend && python start.py"

timeout /t 3 /nobreak > nul

echo [Frontend] Starting Vite dev server in new window...
start "Frontend - Vite" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Both servers are starting!
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:8386
echo ========================================
echo.
echo Close the terminal windows to stop the servers.
pause
