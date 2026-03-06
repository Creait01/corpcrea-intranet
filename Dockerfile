FROM node:20-alpine

WORKDIR /app

COPY . .

# Dummy URL only for prisma generate at build time (ARG does NOT persist at runtime)
ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npm ci
RUN npx prisma generate
RUN npm run build
RUN npx tsc -p server/tsconfig.json

EXPOSE 3000

# At runtime, Railway injects the real DATABASE_URL env var
CMD npx prisma db push && node server-dist/server/index.js
