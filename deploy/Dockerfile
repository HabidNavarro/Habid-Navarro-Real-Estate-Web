# Sitio de Habid Navarro Bienes Raices.
#
# Etapa 1: compila con la misma version de Node que usa la laptop (.node-version).
# Etapa 2: solo Caddy sirviendo dist/. La imagen final no lleva Node ni node_modules,
# asi que en ejecucion no hay dependencias de npm expuestas.

FROM node:20-alpine AS build
WORKDIR /app

# Se copian primero los manifiestos para que Docker cachee `npm ci` mientras
# no cambien las dependencias.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM caddy:2-alpine
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
EXPOSE 8080
