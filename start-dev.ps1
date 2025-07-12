# StackIt Development Server Startup Script
Write-Host "Starting StackIt Development Servers..." -ForegroundColor Green
Write-Host ""

# Start Flask API Server
Write-Host "Starting Flask API Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'e:\TY\Projects\Odoo\StackIt\app\api'; python app.py"

# Wait for Flask server to start
Write-Host "Waiting for Flask server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Next.js Development Server
Write-Host "Starting Next.js Development Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'e:\TY\Projects\Odoo\StackIt'; npm run dev"

Write-Host ""
Write-Host "Both servers are starting up!" -ForegroundColor Green
Write-Host "Flask API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Next.js App: http://localhost:3000 or http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
