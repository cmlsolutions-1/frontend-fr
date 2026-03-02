# 1) Build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2) Run (nginx)
FROM nginx:alpine

# Copia el build a nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Opcional: SPA fallback (React Router) -> siempre devuelves index.html
# Reemplaza la config default de nginx:
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]