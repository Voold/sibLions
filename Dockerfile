FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY package*.json ./

RUN npm install --omit=dev

EXPOSE 3000

CMD ["sh", "-c", "node dist/db/migrate.js && node dist/index.js"]