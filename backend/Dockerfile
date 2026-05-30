# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodeuser -G nodejs && \
    chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 8080

CMD ["node", "dist/index.js"]
