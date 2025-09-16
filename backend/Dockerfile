#FROM node:20

#WORKDIR /app

#COPY package*.json ./

#RUN npm install

#COPY . .

#CMD ["node", "index.js"]

# backend/Dockerfile
FROM node:20-bookworm-slim
WORKDIR /app

ENV NODE_ENV=production PORT=3443

# Copia solo ciò che serve a runtime
COPY package.json package-lock.json ./
COPY node_modules/ ./node_modules/
COPY . .

EXPOSE 3443
CMD ["node", "index.js"]
