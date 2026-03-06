FROM node:22-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files and install ALL dependencies (including dev for build tools)
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# Copy the rest of the application
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build frontend (Vite)
RUN npm run build

# Build server (TypeScript -> server-dist)
RUN npx tsc -p server/tsconfig.json

# Expose port
EXPOSE 3000

# Start: push DB schema then run server
CMD npx prisma db push && node server-dist/server/index.js
