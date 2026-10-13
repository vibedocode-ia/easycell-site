#!/bin/sh
set -e

echo "🚀 [EasyCell] Iniciando Backend Fastify na porta 3001..."
npm run api &

echo "🌐 [EasyCell] Iniciando Nginx na porta 80..."
exec nginx -g "daemon off;"
