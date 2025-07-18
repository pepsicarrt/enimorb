FROM oven/bun:alpine AS build

WORKDIR /app

# Cache Bun dependencies in Docker BuildKit cache
COPY package.json bun.lock tsconfig.json ./

RUN bun install --production

COPY . .

RUN bun run build

FROM zydou/caddy:distroless
#caddy:alpine

COPY --from=build /app/dist /usr/share/caddy

EXPOSE 80
