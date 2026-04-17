# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM --platform=linux/amd64 node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build


# ── Stage 2: production ────────────────────────────────────────────────────────
FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

# Install production deps and rebuild better-sqlite3 native module for linux/amd64
RUN npm ci --omit=dev && \
    npm rebuild better-sqlite3

COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=5000
ENV DB_PATH=/app/data/vocab.db

EXPOSE 5000

CMD ["node", "dist/index.js"]
