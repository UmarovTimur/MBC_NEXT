# Используем образ Node.js, который вам нужен для разработки
FROM node:24.5-slim AS dev

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файлы манифеста и блокировки
COPY package.json yarn.lock ./

# Копируем папку Prisma (необходимо для генерации клиента)
COPY prisma ./prisma

# Устанавливаем зависимости
# В режиме dev обычно не используется --frozen-lockfile, 
# чтобы была возможность устанавливать новые зависимости при необходимости,
# но для консистентности образа мы можем оставить yarn install
RUN yarn install

# Копируем остальной исходный код
COPY . .

# Принимаем аргумент для DATABASE_URL
ARG DATABASE_URL

# Устанавливаем переменную окружения для DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Генерируем клиент Prisma
# Этот шаг нужен, чтобы клиент Prisma был доступен при запуске в dev
RUN npx prisma generate

# Отключаем телеметрию Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# Next.js Dev Mode использует порт 3000 по умолчанию
EXPOSE 3000

# Устанавливаем HOSTNAME для корректной работы в контейнере
ENV HOSTNAME "0.0.0.0"

# Команда для запуска Next.js в режиме разработки
# 'yarn dev' или 'npm run dev' запустит сервер с hot-reloading
CMD ["yarn", "dev"]