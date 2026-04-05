# SashaShop

Монорепозиторій e-commerce проєкту `SashaShop`.

## Структура

- `frontend` — Next.js 16, React 19, TypeScript, Tailwind, React Query, Zustand
- `backend` — NestJS 11, GraphQL (Apollo), Prisma, PostgreSQL, JWT auth
- `package.json` (root) — запуск обох сервісів через `concurrently`

## Вимоги

- Node.js 20+
- Yarn 1.x
- PostgreSQL 14+

## Швидкий старт

```bash
# 1) Встановити залежності
yarn install
yarn --cwd frontend install
yarn --cwd backend install

# 2) Налаштувати змінні оточення
# backend/.env
# frontend/.env

# 3) Prisma
cd backend
yarn prisma migrate resolve --applied 0000_baseline
yarn prisma migrate deploy
yarn prisma generate
cd ..

# 4) Запуск frontend + backend
yarn dev
```

Після запуску:

- Frontend: `http://localhost:3000`
- Backend GraphQL: `http://localhost:3001/graphql`

## Скрипти

### Root

- `yarn dev` — паралельно запускає frontend + backend
- `yarn dev:frontend` — тільки frontend
- `yarn dev:backend` — тільки backend
- `yarn install:all` — встановлення залежностей у всіх пакетах

### Frontend

```bash
cd frontend
yarn dev
yarn build
yarn start
yarn lint
```

### Backend

```bash
cd backend
yarn start:dev
yarn build
yarn test
```

## Змінні оточення

### `backend/.env`

```env
PORT=3001
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/sasha-shop"
JWT_SECRET="change-me"
JWT_EXPIRES_IN="7d"

TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
```

### `frontend/.env`

```env
NEXT_PUBLIC_GRAPHQL_URL="/api/graphql"
BACKEND_GRAPHQL_URL="http://localhost:3001/graphql"
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
```

## База даних і міграції

У проєкті використовується Prisma (`backend/prisma/schema.prisma`).

Ключові команди:

```bash
cd backend

# Застосувати міграції
# (підходить для локального середовища з уже існуючою БД)
yarn prisma migrate resolve --applied 0000_baseline
yarn prisma migrate deploy

# Генерація Prisma Client
yarn prisma generate
```

> Якщо таблиці не існують (наприклад `ShopSettings`) і бачиш `P2021`, це означає, що міграції не застосовані до поточної БД.

## Авторизація та ролі

- JWT зберігається у frontend store (`zustand`)
- Захищені маршрути проходять через `AuthGate`
- Адмінські GraphQL резолвери захищені `GqlAuthGuard + RolesGuard`
- Роль `ADMIN` обовʼязкова для `/dashboard` API запитів

## Налаштування магазину (`/dashboard/settings`)

Налаштування зберігаються у таблиці `ShopSettings` і впливають на:

- назву магазину
- контакти (email, телефон, Telegram)
- SEO опис
- валюту відображення цін
- часовий пояс форматування дат
- префікс номера замовлення

## Типові проблеми

### 1) `POST /api/graphql 502`

Frontend не зміг підключитися до backend GraphQL.

Перевір:

- чи запущений backend на `3001`
- чи коректний `BACKEND_GRAPHQL_URL` у `frontend/.env`

### 2) `Unauthorized` в адмінці

Причина: невалідна сесія або користувач без ролі `ADMIN`.

Що зробити:

- перелогінитися
- перевірити роль користувача в БД

### 3) `P2021 table does not exist`

Міграції не застосовані до поточної БД.

Виконай блок команд з розділу **База даних і міграції**.
