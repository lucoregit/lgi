@echo off
title LGI - Inicializador Docker
chcp 65001 > nul
echo ====================================================
echo        INICIANDO O SISTEMA LGI VIA DOCKER
echo ====================================================
echo.

cd /d "%~dp0"

echo [1/2] Construindo e iniciando containers (Backend + Frontend)...
docker compose up -d --build

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao iniciar containers. Verifique se o Docker Desktop esta aberto e tente novamente.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Aguardando servidores inicializarem...
timeout /t 5 /nobreak > nul

echo.
echo Abrindo sistema no navegador...
start http://localhost

echo.
echo ====================================================
echo  TUDO PRONTO! O LGI esta rodando no Docker.
echo  Acesse: http://localhost ou http://localhost:3000
echo  Para parar: execute 'parar_docker.bat'
echo ====================================================
timeout /t 3 /nobreak > nul
