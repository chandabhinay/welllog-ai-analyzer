# Quick Start Script for Windows PowerShell
# Well Log Analysis System Setup

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Well Log Analysis System - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✓ PostgreSQL installed: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ PostgreSQL not found. Please install from https://www.postgresql.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setting up Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Backend setup
Set-Location backend

Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install

if (!(Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠ IMPORTANT: Please edit backend\.env with your credentials!" -ForegroundColor Red
    Write-Host "  - Database password" -ForegroundColor Yellow
    Write-Host "  - AWS S3 credentials" -ForegroundColor Yellow
    Write-Host "  - OpenAI API key" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter after editing .env file"
}

Write-Host ""
Write-Host "Initializing database..." -ForegroundColor Yellow
Write-Host "(Make sure PostgreSQL is running and you've created the database)" -ForegroundColor Yellow
Write-Host ""

$initDb = Read-Host "Initialize database now? (y/n)"
if ($initDb -eq 'y') {
    npm run init-db
}

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setting up Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Frontend setup
Set-Location frontend

Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start backend (in one terminal):" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2. Start frontend (in another terminal):" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Open browser to: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "For detailed setup instructions, see SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

$startNow = Read-Host "Start servers now? (y/n)"
if ($startNow -eq 'y') {
    Write-Host "Starting backend server..." -ForegroundColor Yellow
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
    
    Start-Sleep -Seconds 3
    
    Write-Host "Starting frontend server..." -ForegroundColor Yellow
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
    
    Write-Host ""
    Write-Host "Servers starting in separate windows..." -ForegroundColor Green
    Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
    Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
}
