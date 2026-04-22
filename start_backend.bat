@echo off
echo === AcadPredict Backend Startup ===
cd /d "%~dp0backend"

REM Check if virtual environment exists
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

REM Activate venv
call .venv\Scripts\activate.bat

REM Install requirements
echo Installing dependencies...
pip install -r requirements.txt --quiet

REM Start the server
echo.
echo Starting FastAPI server on http://localhost:8001
echo API Docs: http://localhost:8001/docs
echo.
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload

pause
