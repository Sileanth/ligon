# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Build arguments for Vite
ARG VITE_CLIENT_TOKEN
ARG VITE_GAME_VERSION
ARG VITE_ASSETS_VERSION

ENV VITE_CLIENT_TOKEN=$VITE_CLIENT_TOKEN
ENV VITE_GAME_VERSION=$VITE_GAME_VERSION
ENV VITE_ASSETS_VERSION=$VITE_ASSETS_VERSION

RUN npm run build

# Serve Stage
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
