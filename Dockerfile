FROM node:20-alpine

WORKDIR /app

# Copiar definiciones de dependencias
COPY package*.json ./

# Instalar dependencias (con fallback tolerante a fallos de red)
RUN npm install --omit=dev --no-audit --no-fund || true

# Copiar código fuente, assets e imágenes
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
