#!/bin/bash
echo "===================================================="
echo "       INICIANDO O SISTEMA LGI VIA DOCKER"
echo "===================================================="
echo ""

cd "$(dirname "$0")"

docker compose up -d --build

if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao iniciar containers. Verifique se o Docker esta ativo."
    exit 1
fi

echo ""
echo "Aguardando inicializacao..."
sleep 5

echo "Abrindo navegador..."
if which xdg-open > /dev/null; then
    xdg-open http://localhost
elif which open > /dev/null; then
    open http://localhost
fi

echo ""
echo "===================================================="
echo " TUDO PRONTO! Acesse: http://localhost"
echo " Para parar: ./parar_docker.sh"
echo "===================================================="
