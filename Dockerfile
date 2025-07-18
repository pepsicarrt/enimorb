FROM oven/bun:alpine AS build

WORKDIR /app

# Cache Bun dependencies in Docker BuildKit cache
COPY package.json bun.lock tsconfig.json ./

RUN bun install --production

COPY . .

RUN bun run build

FROM nginx:1-alpine3.22-slim

COPY --from=build /app/dist /usr/share/nginx/html 
EXPOSE 80
