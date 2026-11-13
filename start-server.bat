@echo off
setlocal
cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)

echo Starting Teyvat Strategist server at http://localhost:3000 ...
call npm run dev
if errorlevel 1 (
  echo Server exited with an error.
  pause
  exit /b 1
)
