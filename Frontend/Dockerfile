# ============================================================
#  Frontend - Compañía ACME (Angular)
#  Etapa 1: compilar  |  Etapa 2: servir con nginx
# ============================================================

# ---------- Etapa 1: build ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
# --legacy-peer-deps: ngx-charts declara peers antiguos que chocan con Angular 21.
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ---------- Etapa 2: servir ----------
FROM nginx:alpine

# Archivos estáticos generados por Angular.
COPY --from=build /app/dist/proyecto-clases/browser /usr/share/nginx/html

# Configuración SPA (fallback a index.html).
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
