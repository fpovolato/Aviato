# Stage 1: build Angular
FROM node:18-alpine AS builder
WORKDIR /app

# copia solo package.json e lock per layer caching
COPY package.json package-lock.json ./
RUN npm ci           # install più pulito di `npm install`

# copia tutto il codice e build
COPY . .
RUN npm run build -- --configuration production

# Stage 2: serve con Nginx
FROM nginx:stable-alpine

# rimuovi la pagina di default e tutto il contenuto preesistente
RUN rm -rf /usr/share/nginx/html/*

# copia la build Angular
COPY --from=builder /app/dist/dashboard /usr/share/nginx/html

# copia la config personalizzata
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]