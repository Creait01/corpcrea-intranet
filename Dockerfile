FROM node:20-alpine

WORKDIR /app

COPY . .

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npm ci
RUN npx prisma generate
RUN npm run build
RUN npx tsc -p server/tsconfig.json

# Unset dummy URL so Railway's real DATABASE_URL is used at runtime
RUN unset DATABASE_URL

EXPOSE 3000

CMD ["node", "server-dist/server/index.js"]
