#!/usr/bin/env bash
# Deploy / atualização do site AC2RP na VPS a partir da imagem no GHCR.
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Baixando a imagem mais recente do GHCR..."
docker compose -f docker-compose.prod.yml pull

echo "==> Subindo o container..."
docker compose -f docker-compose.prod.yml up -d

echo "==> Limpando imagens antigas..."
docker image prune -f

echo "==> Pronto. Site no ar em http://$(hostname -I 2>/dev/null | awk '{print $1}') (porta 80)."
