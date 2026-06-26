# ============================================================
#  Backend - Compañía ACME (Express + MySQL + JWT)
# ============================================================
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero (mejor cacheo de capas).
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar el resto del código.
COPY . .

# Carpeta para imágenes subidas.
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "app.js"]
