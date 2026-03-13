@echo off
REM ============================================
REM KAA KUAA — Script de Inicializacao (Windows)
REM ============================================
REM Uso:
REM   start.bat          → Inicia TUDO
REM   start.bat web      → So o frontend web
REM   start.bat backend  → So o backend
REM   start.bat db       → So o banco de dados
REM   start.bat install  → Instala dependencias
REM   start.bat stop     → Para tudo
REM ============================================

echo.
echo   ======================================
echo        KAA KUAA PLATFORM
echo     Desafie-se. Regenere o Planeta.
echo   ======================================
echo.

set CMD=%1
if "%CMD%"=="" set CMD=all

if "%CMD%"=="install" goto :install
if "%CMD%"=="db" goto :db
if "%CMD%"=="backend" goto :backend
if "%CMD%"=="web" goto :web
if "%CMD%"=="all" goto :all
if "%CMD%"=="stop" goto :stop
echo Uso: start.bat [all^|web^|backend^|db^|install^|stop]
goto :eof

:install
echo [KAA KUAA] Instalando dependencias...
npm install --legacy-peer-deps
echo [KAA KUAA] Dependencias instaladas!
goto :eof

:db
echo [KAA KUAA] Iniciando PostgreSQL + Redis...
docker compose up -d
echo [KAA KUAA] Banco de dados rodando!
echo   PostgreSQL: localhost:5432
echo   Redis: localhost:6379
goto :eof

:backend
call :db
echo [KAA KUAA] Iniciando Backend (porta 4000)...
cd apps\backend
start "KaaKuaa-Backend" npm run dev
cd ..\..
echo [KAA KUAA] API: http://localhost:4000/api/v1
goto :eof

:web
echo [KAA KUAA] Iniciando Frontend Web (porta 3000)...
cd apps\web
start "KaaKuaa-Web" npm run dev
cd ..\..
echo [KAA KUAA] Web: http://localhost:3000
goto :eof

:all
call :db
timeout /t 3 /nobreak >nul
echo [KAA KUAA] Iniciando Backend...
cd apps\backend
start "KaaKuaa-Backend" npm run dev
cd ..\..
timeout /t 2 /nobreak >nul
echo [KAA KUAA] Iniciando Frontend Web...
cd apps\web
start "KaaKuaa-Web" npm run dev
cd ..\..
echo.
echo [KAA KUAA] =============================
echo [KAA KUAA] Tudo rodando!
echo [KAA KUAA]
echo [KAA KUAA]   Web:     http://localhost:3000
echo [KAA KUAA]   API:     http://localhost:4000/api/v1
echo [KAA KUAA]   Postgres: localhost:5432
echo [KAA KUAA]   Redis:    localhost:6379
echo [KAA KUAA]
echo [KAA KUAA] Para parar: start.bat stop
echo [KAA KUAA] =============================
goto :eof

:stop
echo [KAA KUAA] Parando servicos...
taskkill /FI "WINDOWTITLE eq KaaKuaa-Backend*" /F 2>nul
taskkill /FI "WINDOWTITLE eq KaaKuaa-Web*" /F 2>nul
docker compose down 2>nul
echo [KAA KUAA] Tudo parado!
goto :eof
