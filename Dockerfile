# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install all dependencies (dev included for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source
COPY . .

# Build frontend (Vite → dist/)
RUN npm run build

# Compile server TypeScript
RUN npx tsc -p server/tsconfig.json

# ---------- Production Stage ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy dependency manifests & install production deps only
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci --omit=dev
RUN npx prisma generate

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server-dist ./server-dist

EXPOSE 3000

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node server-dist/server/index.js"]
