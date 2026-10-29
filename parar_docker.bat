@echo off
title LGI - Finalizador Docker
chcp 65001 > nul
echo ====================================================
echo             PARANDO CONTAINERS LGI DOCKER
echo ====================================================
echo.

cd /d "%~dp0"
docker compose down

echo.
echo ====================================================
echo  [OK] Containers finalizados com sucesso!
echo ====================================================
timeout /t 2 /nobreak > nul

