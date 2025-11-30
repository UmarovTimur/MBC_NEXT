# 1. Зависимости (Deps)
FROM node:24.5-slim AS deps
WORKDIR /app

# Принимаем аргумент, переданный из docker-compose
ARG DATABASE_URL

# Копируем файлы для установки зависимостей
COPY package.json yarn.lock ./
COPY prisma ./prisma
# Используем yarn install --frozen-lockfile для детерминированной установки
RUN yarn install --frozen-lockfile

# 2. Сборка (Builder)
FROM node:24.5-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG DATABASE_URL

ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED 1
# Используем yarn build
RUN yarn build 

# 3. Запуск (Runner)
FROM node:24.5-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Создаем пользователя для безопасности
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

# Копируем сбилженное приложение (Standalone Build)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Копируем prisma schema и migrations для потенциального запуска миграций
COPY --from=builder /app/prisma ./prisma

# USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# В Production мы запускаем сбилженный сервер
CMD ["node", "server.js"]