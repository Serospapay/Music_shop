@echo off
setlocal EnableExtensions
cd /d "%~dp0"

REM Messages in English only: Windows cmd.exe breaks UTF-8/Cyrillic in .bat files.

echo.
echo === Octave: full Docker stack (mongo, catalog-service, order-service, web) ===
echo.

where docker >nul 2>nul
if errorlevel 1 (
  echo [ERROR] "docker" not found in PATH. Install Docker Desktop for Windows.
  pause
  exit /b 1
)

docker info >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Docker Engine is not running. Start Docker Desktop and wait until it is ready.
  pause
  exit /b 1
)

if not exist ".env" (
  echo [WARN] No .env file. Copy .env.example to .env
  echo.
)

echo Project directory: %CD%
echo.

docker compose version >nul 2>&1
if not errorlevel 1 (
  echo Using: docker compose - Compose V2
  echo Open: http://localhost:3000    Stop: Ctrl+C
  echo Optional after first start: npm run docker:seed
  echo.
  docker compose up --build
  goto after_compose
)

where docker-compose >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Neither "docker compose" nor "docker-compose" is available.
  echo In Docker Desktop: Settings - General - enable "Use Docker Compose V2".
  pause
  exit /b 1
)

echo Using: docker-compose - Compose V1
echo Open: http://localhost:3000    Stop: Ctrl+C
echo Optional: npm run docker:seed
echo.
docker-compose up --build

:after_compose
echo.
pause
exit /b 0
