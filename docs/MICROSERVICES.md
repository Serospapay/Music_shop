# Мікросервісна архітектура (Октава)

## Схема

```text
[Клієнт / браузер]
        │
        ▼
┌───────────────────┐
│  web (контейнер)  │  Next.js standalone: UI, API routes, BFF
│  порт 3000        │
└─────────┬─────────┘
          │ HTTP (внутрішньо)
          ▼
┌───────────────────┐     HTTP      ┌────────────────────┐
│  order-service    │ ────────────► │  catalog-service   │
│  (замовлення)     │  перевірка   │  (каталог: ціна,    │
│                   │   позицій    │   наявність)       │
└─────────┬─────────┘              └─────────┬──────────┘
          │                                    │
          └────────────────┬─────────────────────┘
                         ▼
                  ┌─────────────┐
                  │  MongoDB    │
                  └─────────────┘
```

- **catalog-service** — володіє читанням таблиці товарів для бізнес-перевірки при checkout (`/internal/validate-checkout-items`).
- **order-service** — створює записи `Order` / `OrderItem`; перед збереженням запитує каталог.
- **web** (образ з кореневого `Dockerfile`, `output: "standalone"`) — повний Next.js у контейнері; `POST /api/checkout` звертається до **order-service** за `ORDER_SERVICE_URL`. Якщо змінні не задані (розробка без Docker), у коді лишається fallback на Prisma у процесі Next.

## Змінні середовища

| Змінна | Хто читає | Опис |
|--------|-----------|------|
| `SERVICE_INTERNAL_TOKEN` | catalog-service, order-service, Next (лише сервер) | Спільний секрет для `Authorization: Bearer …` між сервісами |
| `ORDER_SERVICE_URL` | **web** (Next у контейнері) | У Docker: `http://order-service:4002` (compose задає автоматично) |
| `CATALOG_SERVICE_URL` | order-service | Базовий URL catalog-service, у Docker: `http://catalog-service:4001` |
| `DATABASE_URL` | catalog, order, **web** | У Docker задається через `MONGO_DB_NAME` у `.env`: `mongodb://mongo:27017/${MONGO_DB_NAME}` — **має збігатися** з базою, куди ви робили `db:seed` на хості |
| `MONGO_DB_NAME` | лише **docker compose** (підстановка в URI) | Напр. `octave_shop` або `bilinskiy_sound`; без збігу з реальними даними мікросервіси бачать порожній каталог |

## Запуск

**Повний стек у Docker:** `start.bat` або `docker compose up --build` / `npm run docker:up` — піднімаються **mongo**, **catalog-service**, **order-service**, **web** (Next на **:3000**). Скопіюйте `.env.example` → `.env` і задайте паролі.

**Образи catalog-service / order-service** зібрані на **`node:20-bookworm-slim`** (Debian) з `openssl` — у чистому Alpine Prisma engine (`linux-musl`) часто падає з помилкою `libssl.so.1.1: No such file or directory`.

**Сервіс `db-seed`** (`Dockerfile.seed`) — одноразовий контейнер після готового Mongo: `prisma db push` + демо-сид у ту саму БД, що й `MONGO_DB_NAME`. **catalog-service** стартує лише після успішного завершення сиду (`service_completed_successfully`), щоб після перезбірки стеку каталог не був порожнім.

Перша ініціалізація БД (з хоста, поки працює Mongo на `localhost:27017`):

```bash
set DATABASE_URL=mongodb://127.0.0.1:27017/octave_shop
npx prisma db push
npm run db:seed
```

**Лише Next без Docker-образу:** `npm run dev` (як раніше).

## Безпека

Внутрішні ендпоінти не призначені для публічного інтернету: у проді сервіси слід тримати в приватній мережі (VPC / Docker network), доступ лише з BFF.
