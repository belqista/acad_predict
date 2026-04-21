@echo off
echo === AcadPredict Frontend Startup ===
cd /d "%~dp0frontend"

REM Install npm dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing npm packages...
    npm install
)

echo.
echo Starting Vite dev server on http://localhost:3000
echo.
npm run dev

pause
