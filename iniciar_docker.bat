@echo off
title LGI - Inicializador Docker
chcp 65001 > nul
echo ====================================================
echo        INICIANDO O SISTEMA LGI VIA DOCKER
echo ====================================================
echo.

cd /d "%~dp0"

echo [1/3] Criando atalho na Area de Trabalho com o icone do LGI...
if exist "criar_atalho.vbs" (
    cscript //nologo "%~dp0criar_atalho.vbs" > nul 2>&1
)

echo [2/3] Construindo e iniciando containers (Backend + Frontend)...
docker compose up -d --build

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao iniciar containers. Verifique se o Docker Desktop esta aberto e tente novamente.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Aguardando servidores e banco H2 inicializarem...
timeout /t 5 /nobreak > nul

echo.
echo Abrindo sistema no seu navegador padrao...
start http://localhost

echo.
echo ====================================================
echo  TUDO PRONTO! O LGI esta rodando no Docker.
echo.
echo  Acesse: http://localhost ou http://localhost:3000
echo.
echo  DICA: Foi criado o atalho 'LGI - Iniciar Sistema' na
echo  sua Area de Trabalho com o icone do LGI.
echo  Clique com o botao direito nele e escolha:
echo  'Fixar na barra de tarefas' para iniciar sempre com 1 clique!
echo.
echo  Para parar: execute 'parar_docker.bat'
echo ====================================================
timeout /t 4 /nobreak > nul
