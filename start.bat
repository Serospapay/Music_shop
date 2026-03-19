@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo === Октава — локальний запуск ===
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ПОМИЛКА] Node.js не знайдено. Встановіть LTS з https://nodejs.org/
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo [1/3] Встановлення залежностей npm...
  call npm install
  if errorlevel 1 (
    echo [ПОМИЛКА] npm install завершився з помилкою.
    pause
    exit /b 1
  )
) else (
  echo [1/3] node_modules вже є — пропускаємо npm install.
)

echo [2/3] Prisma generate...
call npx prisma generate
if errorlevel 1 (
  echo.
  echo [УВАГА] prisma generate завершився з помилкою.
  echo         На Windows часто EPERM на query_engine — закрийте інші node.exe, dev-сервер або вікно з "npm run dev".
  echo         Продовжуємо запуск: якщо Prisma-клієнт уже згенерований, dev зазвичай працює.
  echo         Вручну: npx prisma generate
  echo.
) else (
  echo     Prisma OK.
)

echo [3/3] Запуск Next.js dev-сервера ^(http://localhost:3000^)...
echo     Зупинка: Ctrl+C
echo.
call npm run dev

echo.
pause
