# Сборка
FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@10
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build && pnpm prune --prod

# Запуск Node-сервера Astro: страницы, онлайн-запись и админка
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

ENV HOST=0.0.0.0
ENV PORT=80
# Контент, заявки и фото — в volume, чтобы переживали обновления:
# docker run -v ns-data:/app/data -e ADMIN_PASSWORD=... -e SESSION_SECRET=... ...
ENV DATA_DIR=/app/data
VOLUME ["/app/data"]

EXPOSE 80
CMD ["node", "./dist/server/entry.mjs"]
