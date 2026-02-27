# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

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
COPY prisma.config.ts ./
RUN npm ci --omit=dev
RUN npx prisma generate

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server-dist ./server-dist

EXPOSE 3000

# Push schema to DB (creates tables if they don't exist) then start server
CMD ["sh", "-c", "npx prisma db push && node server-dist/server/index.js"]
