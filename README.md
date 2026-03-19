# Октава (octave-shop)

Інтернет-магазин музичних інструментів на **Next.js 14 (App Router)** з каталогом, кошиком, оформленням замовлень і адмін-панеллю. Дані — **MongoDB** через **Prisma**. Бренд у проєкті: **Октава**.

---

## Можливості

- **Вітрина:** головна з 3D-каруселлю товарів, інтро зі статистикою каталогу, блок практичної інформації.
- **Каталог:** фільтр за категорією та діапазоном цін, пошук за назвою, сортування за ціною, пагінація.
- **Сторінка товару:** інтерактивний герой (нахил під курсором, лайтбокс), липка панель на десктопі, розгортання опису, копіювання посилання, схожі товари з тієї ж категорії, мобільний sticky CTA.
- **Кошик:** Zustand + `localStorage`, бічна панель у хедері.
- **Оформлення:** форма з валідацією (Zod + RHF), API `POST /api/checkout`, запис замовлення в БД, опційний лист через **Resend**.
- **Адмінка:** `/admin` — JWT-сесія в cookie (`jose`), пароль з `ADMIN_PASSWORD`; товари (CRUD через server actions), перегляд замовлень.
- **Обмеження запитів:** in-memory або **Upstash Redis** для rate limit на чутливих маршрутах.
- **Завантаження зображень:** `POST /api/upload` для адмінки (збереження в `public`).

---

## Стек

| Шар | Технології |
|-----|------------|
| Фреймворк | Next.js 14, React 18, TypeScript |
| Стилі | Tailwind CSS, токени бренду в `app/globals.css` |
| Анімації | Framer Motion |
| БД | MongoDB + Prisma ORM |
| Форми | react-hook-form, @hookform/resolvers, zod |
| Стан кошика | zustand + persist |
| Адмін JWT | jose |
| Пошта | Resend (опційно) |
| Rate limit | @upstash/ratelimit (опційно) |

---

## Вимоги

- **Node.js** 18+ (рекомендовано LTS)
- **MongoDB** локально або Atlas (URI у `DATABASE_URL`)
- npm або сумісний менеджер пакетів

---

## Швидкий старт

### 1. Клонування та залежності

```bash
cd MS
npm install
```

Після `npm install` автоматично виконується `prisma generate` (`postinstall`).

### 2. Змінні середовища

Скопіюйте приклад і відредагуйте:

```bash
copy .env.example .env
```

Обов’язкові для повноцінної роботи:

| Змінна | Опис |
|--------|------|
| `DATABASE_URL` | Рядок підключення MongoDB, напр. `mongodb://127.0.0.1:27017/octave_shop` |
| `ADMIN_PASSWORD` | Пароль входу в `/admin` |
| `NEXT_PUBLIC_SITE_URL` | Базовий URL сайту (для metadata, Open Graph, копіювання посилання на товар) |

Решта — опційно: `ADMIN_SESSION_SECRET`, `RESEND_*`, `UPSTASH_*`, `NEXT_IMAGE_REMOTE_HOSTS`. Деталі в `.env.example`.

### 3. Схема БД

```bash
npx prisma db push
```

### 4. Демо-дані (опційно)

Сид наповнює колекцію `Product` через драйвер MongoDB (стійко до **standalone** Mongo без replica set):

```bash
npm run db:seed
```

### 5. Розробка

```bash
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000).

### Windows: `start.bat`

У корені репозиторію є `start.bat`: перевіряє Node, за потреби ставить залежності, намагається `prisma generate` (при помилці **EPERM** на Windows скрипт **не зупиняється** — можна продовжити `npm run dev`), далі запускає `npm run dev`.

---

## Скрипти npm

| Команда | Призначення |
|---------|-------------|
| `npm run dev` | Dev-сервер Next.js |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Запуск зібраного застосунку |
| `npm run lint` | ESLint |
| `npm run db:seed` | Заповнення демо-товарів |

---

## Адмін-панель

- URL: **`/admin`**, вхід: **`/admin/login`**
- Захист: `middleware.ts` перевіряє cookie `admin_session` (JWT).
- Якщо змінювали issuer/секрет JWT у коді — потрібен повторний вхід.
- Без `ADMIN_PASSWORD` у `.env` адмін-маршрути перенаправляють на логін з помилкою конфігурації.

---

## Структура проєкту (скорочено)

```
app/                    # App Router: сторінки, API, layout
components/             # UI, layout, home, cart, product, admin, catalog
lib/                    # prisma, validators, format, rate-limit, notifications, admin-session
store/                  # Zustand (кошик)
actions/                # Server Actions (адмін, auth)
prisma/                 # schema.prisma, seed.ts
public/                 # статика, uploads з адмінки
```

Ключові маршрути:

- `/` — головна  
- `/catalog` — каталог  
- `/product/[slug]` — товар  
- `/checkout` — оформлення  
- `/about` — про проєкт  
- `/admin`, `/admin/products`, `/admin/orders` — адмінка  
- `/api/checkout`, `/api/upload` — API  

---

## Production build

```bash
npm run build
npm run start
```

Переконайтеся, що в середовищі задані `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD` (і за потреби секрети Resend/Upstash).

На **Windows** якщо `prisma generate` падає з **EPERM**, закрийте інші процеси `node.exe` / IDE, що тримають `query_engine-*.dll`, і повторіть `npx prisma generate`.

---

## Формат ціни

Функція `formatPriceUah` у `lib/format.ts` форматує ціну **без** `Intl` з валютою UAH (щоб уникнути розбіжності SSR/клієнта «₴» vs «грн» і помилок гідрації).

---

## Ліцензія та контекст

Проєкт призначений для навчальних / дипломних цілей. Перед публічним деплоєм змініть паролі, секрети та налаштуйте власний домен і пошту.

---

## Корисні посилання

- [Next.js — App Router](https://nextjs.org/docs/app)
- [Prisma + MongoDB](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [Resend](https://resend.com/)
- [Upstash Redis](https://upstash.com/)

Якщо плануєте розвивати UI — див. `docs/PLAN-UI-REFINEMENT.md`.
