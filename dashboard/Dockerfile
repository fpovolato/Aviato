# dashboard/Dockerfile

# Stage 1: build Angular
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# Stage 2: serve con Nginx
FROM nginx:stable-alpine

# Pulisce la cartella di default
RUN rm -rf /usr/share/nginx/html/*

# Copia il contenuto di dist/dashboard/browser (dove sta index.html) in /usr/share/nginx/html
COPY --from=builder /app/dist/dashboard/browser/. /usr/share/nginx/html

# Copia la config personalizzata
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Esponi HTTP e HTTPS
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]