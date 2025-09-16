@echo off
echo ========================================
echo    Elasticsearch Docker Management
echo ========================================
echo.

:menu
echo Choose an option:
echo 1. Start Elasticsearch
echo 2. Stop Elasticsearch
echo 3. Restart Elasticsearch
echo 4. View logs
echo 5. Setup data (run setup script)
echo 6. Test connection
echo 7. Exit
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto logs
if "%choice%"=="5" goto setup
if "%choice%"=="6" goto test
if "%choice%"=="7" goto exit
goto menu

:start
echo Starting Elasticsearch...
docker-compose up -d elasticsearch
echo Waiting for Elasticsearch to be ready...
timeout /t 10 /nobreak > nul
goto test

:stop
echo Stopping Elasticsearch...
docker-compose down
goto menu

:restart
echo Restarting Elasticsearch...
docker-compose down
docker-compose up -d elasticsearch
echo Waiting for Elasticsearch to be ready...
timeout /t 10 /nobreak > nul
goto test

:logs
echo Showing Elasticsearch logs...
docker-compose logs -f elasticsearch
goto menu

:setup
echo Running setup script...
node setup_elasticsearch.js
goto menu

:test
echo Testing Elasticsearch connection...
curl -X GET "localhost:9200/" 2>nul
if %errorlevel%==0 (
    echo ✅ Elasticsearch is running!
) else (
    echo ❌ Elasticsearch is not responding
)
echo.
goto menu

:exit
echo Goodbye!
exit
