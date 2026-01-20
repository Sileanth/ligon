# Build stage
FROM node:alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Run Stage
FROM node:alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

ENV BACKEND_PORT=3002
ENV DEV=false

EXPOSE ${BACKEND_PORT}

CMD ["npm", "start"]
