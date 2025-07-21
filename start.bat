@echo off
REM Detect the primary IPv4 address (excluding loopback and virtual adapters)
FOR /F "tokens=2 delims=:" %%f IN ('ipconfig ^| findstr /C:"IPv4 Address" /C:"IPv4-adresse"') DO (
    SET IP=%%f
    GOTO :found
)
:found
SET IP=%IP: =%
IF "%IP%"=="" SET IP=localhost

SET FASTEN_EXTERNAL_HOST=%IP%
echo Starting Fasten with external IP: %FASTEN_EXTERNAL_HOST%

docker-compose up 