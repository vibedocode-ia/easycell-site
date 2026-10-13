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
RUN mkdir -p /run/nginx /var/log/nginx /usr/share/nginx/html /app/storage/laudos

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# Copia build estático do frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Configura Nginx para proxy reverso da API e cache do SPA (Alpine usa http.d)
COPY nginx.conf /etc/nginx/http.d/default.conf
RUN rm -rf /etc/nginx/conf.d

# Copia backend e código de schemas Drizzle
COPY server/ ./server/
COPY src/db/ ./src/db/
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 80
CMD ["./entrypoint.sh"]
