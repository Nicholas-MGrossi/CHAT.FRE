@echo off
REM ChatFree Quick Start Script (Windows)

echo.
echo 🚀 ChatFree Quick Start
echo =====================
echo.

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed.
    echo Please install Node.js v16+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%

REM Check for Ollama
where ollama >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  Ollama is not in PATH.
    echo Please ensure Ollama is installed and running.
    echo Download from: https://ollama.ai/
    echo.
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
)

REM Verify Ollama is running
echo.
echo ⏳ Checking Ollama connection...
curl -s http://localhost:11434/api/tags >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Ollama appears to not be running.
    echo Please start Ollama (it usually starts automatically or from the system tray)
    echo.
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
) else (
    echo ✅ Ollama is running!
)

REM Install and setup backend
echo.
echo 📦 Setting up backend...
cd backend
if not exist "node_modules" (
    call npm install
)
echo ✅ Backend ready

REM Install and setup frontend
echo.
echo 📦 Setting up frontend...
cd ..\frontend
if not exist "node_modules" (
    call npm install
)
echo ✅ Frontend ready

cd ..

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Start the backend:
echo    Open a terminal, cd backend, then: npm start
echo.
echo 2. In a new terminal, start the frontend:
echo    cd frontend, then: npm start
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo Happy chatting! 💬
echo.
pause
