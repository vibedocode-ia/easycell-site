#!/bin/sh
set -e

# Garante existência dos diretórios do Nginx e storage no Alpine
mkdir -p /run/nginx /var/log/nginx /app/storage/laudos

echo "🚀 [EasyCell] Iniciando Backend Fastify na porta interna 3001..."
API_PORT=3001 npm run api &

echo "🌐 [EasyCell] Testando configuração do Nginx..."
nginx -t

echo "🌐 [EasyCell] Iniciando Nginx na porta 80 pública..."
exec nginx -g "daemon off;"
