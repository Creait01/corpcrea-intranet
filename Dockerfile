FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build
RUN npx tsc -p server/tsconfig.json

EXPOSE 3000

CMD ["node", "server-dist/server/index.js"]
