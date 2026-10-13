# 1. Build Stage do Frontend Vite
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Runtime Stage com Node.js 20 + Nginx
FROM node:20-alpine AS runtime
RUN apk add --no-cache nginx

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# Copia build estático do frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Configura Nginx para proxy reverso da API e cache do SPA
COPY nginx.conf /etc/nginx/http.d/default.conf
RUN mkdir -p /etc/nginx/conf.d && cp /etc/nginx/http.d/default.conf /etc/nginx/conf.d/default.conf

# Copia backend e código de schemas Drizzle
COPY server/ ./server/
COPY src/db/ ./src/db/
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Garante diretório de storage persistente para laudos PDF
RUN mkdir -p /app/storage/laudos

EXPOSE 80
CMD ["./entrypoint.sh"]
