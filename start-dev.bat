@echo off
echo Starting StackIt Development Servers...
echo.

echo Starting Flask API Server...
start "Flask API" cmd /k "cd /d e:\TY\Projects\Odoo\StackIt\app\api && python app.py"

echo Waiting for Flask server to start...
timeout /t 3 /nobreak > nul

echo Starting Next.js Development Server...
start "Next.js Dev" cmd /k "cd /d e:\TY\Projects\Odoo\StackIt && npm run dev"

echo.
echo Both servers are starting up!
echo Flask API: http://localhost:5000
echo Next.js App: http://localhost:3000 or http://localhost:3001
echo.
pause
