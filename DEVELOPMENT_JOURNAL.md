# Октава — інтернет-магазин музичних інструментів

## 1. Короткий опис проєкту

Це магазин під брендом «Октава»: головна з каруселлю товарів, каталог із фільтрами й пошуком, сторінка товару з фото та відгуками, кошик, оформлення замовлення, особистий кабінет і адмінка, де можна додавати товари й модерувати відгуки. Покупець бачить ціни в гривнях, обирає доставку в формі й отримує підтвердження (лист — якщо налаштована пошта).

Проблема, яку вирішуємо: зібрати **реальний** магазин у браузері — з базою даних, замовленнями й входом у кабінет, а не сторінку-заглушку. Дані лежать у **MongoDB**, до них звертається сайт через **Prisma**. Якщо проєкт крутиться в **Docker**, замовлення можна відправляти через окремі маленькі сервіси (каталог + замовлення); якщо працюєш просто `npm run dev` — усе те саме відбувається всередині одного Next.js, без зайвої складності.

## 2. Стек технологій

- **Next.js 14 (App Router)** — сторінки в папці `app/`, зручні адреси на кшталт `/product/назва-товару`, серверні компоненти там, де не треба анімацій у браузері.
- **TypeScript** — щоб поля товару й замовлення не переплутати; помилки ловляться ще в редакторі.
- **Prisma + MongoDB** — опис колекцій одним файлом `schema.prisma`, запити читаються як звичайний код, без ручного складання JSON до Mongo.
- **Tailwind CSS** — стилі класами в розмітці, кольори бренду винесені в `globals.css`, щоб не шукати «той самий золотий» по всьому проєкту.
- **Framer Motion** — легкі рухи на головній і на картці товару, без важких бібліотек.
- **Zustand** — кошик у пам’яті браузера й у `localStorage`, щоб після оновлення сторінки кошик не зникав.
- **react-hook-form + Zod** — форми не відправляються з порожніми полями: спочатку перевірка, потім запит.
- **jose** — короткий «квиток» у cookie після входу (і для адміна, і для покупця), без зберігання пароля в браузері.
- **bcryptjs** — пароль у базі лише у вигляді хеша.
- **Fastify** — два невеликі сервери поруч із Next у Docker: один перевіряє товари при замовленні, другий записує замовлення.
- **Docker Compose** — один раз підняв Mongo + сервіси + сайт, щоб не ставити все вручну на машині перевіряючого.

## 3. Архітектура

Підхід простий: **все, що бачить покупець**, рендерить Next (сторінки, форми, кошик). **Що лежить у базі** — читає і змінює Prisma з `lib/prisma.ts`.

Коли мікросервіси **вимкнені**, кнопка «Оформити» б’є в `POST /api/checkout`, і там у одній транзакції перевіряються товари й створюється замовлення — як у звичайному інтернет-магазині в одному проєкті.

Коли мікросервіси **увімкнені** (змінні в `.env`), той самий `POST /api/checkout` пересилає дані в сервіс замовлень; той перед збереженням питає сервіс каталогу: чи є такі товари, чи актуальні ціни. Так на дипломі видно розділення ролей, але для розробки можна жити без цього.

Захист сторінок: `middleware.ts` не пускає в кабінет без входу й в адмінку без пароля адміністратора. Сесії — у зашифрованих cookie, не в `localStorage`.

Окрема історія — **Docker**. Після чистого запуску Mongo порожня: на вітрині нуль товарів. Тому в `docker-compose` додано крок **db-seed**: маленький контейнер після старту Mongo накочує схему й демо-товари, і лише потім піднімається решта. Інакше після кожного «перезібрав білд» здається, що «нічого не працює», хоча просто база пуста.

## 4. Структура проєкту

```
MS/
├── app/                         # Сторінки та API (App Router)
│   ├── page.tsx                 # Головна
│   ├── catalog/                 # Каталог
│   ├── product/[slug]/          # Картка товару
│   ├── checkout/                # Оформлення
│   ├── login, register, account/
│   ├── admin/                   # Адмінка
│   └── api/                     # checkout, upload, перевірка БД
├── actions/                     # Server actions: логін, товари, відгуки
├── components/                  # Блоки інтерфейсу (хедер, картки, форми)
├── lib/                         # Prisma, перевірки полів, сесії, ліміти запитів
├── prisma/
│   ├── schema.prisma            # Моделі MongoDB
│   └── seed.ts                  # Демо-наповнення
├── services/
│   ├── catalog-service/         # Перевірка кошика при мікросервісах
│   └── order-service/           # Запис замовлення
├── Dockerfile                   # Збірка Next для продакшену
├── Dockerfile.seed              # Одноразове наповнення БД у Compose
├── docker-compose.yml
├── start.bat                    # Запуск Docker з Windows (текст без кирилиці — обмеження cmd)
└── middleware.ts                # Хто куди може зайти
```

## 5. Хронологія розробки

---

### Етап 1: Що зберігати в базі

Спочатку домовились, **що** взагалі є в магазині: товар із ціною й фото, замовлення з рядками, покупець з паролем, відгук зі статусом «на перевірці / схвалено / відхилено». Усе це описали в Prisma — далі фронт і адмінка говорять з однаковими полями.

**Код:**

```prisma
// prisma/schema.prisma (фрагмент)
model Product {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  name   String
  slug   String @unique
  price  Float
  inStock Boolean @default(true)
}

model Order {
  id          String @id @default(auto()) @map("_id") @db.ObjectId
  totalAmount Float
  userId      String? @db.ObjectId
  items       OrderItem[]
}
```

**Пояснення:** У кожного товару є **slug** — коротка назва для адреси в браузері. Замовлення може бути без користувача (гість), тому `userId` з знаком питання. Далі вже навішували індекси під пошук і фільтри, щоб каталог не гальмував на великій кількості позицій.

**Результат (перевірка схеми):** після змін у `schema.prisma` команда `npx prisma validate` має завершуватися без помилок; `npx prisma db push` застосовує індекси до MongoDB.

---

### Етап 2: Каталог на сервері

Каталог не підвантажує товари окремим «скриптом у браузері» — сторінка на сервері сама запитує Prisma: які фільтри в рядку адреси, такий і запит. Так покупець одразу бачить HTML з товарами, а не порожню сторінку з крутилкою.

**Код:**

```ts
// app/catalog/page.tsx (фрагмент)
const where: Prisma.ProductWhereInput = {};
if (selectedCategory) where.category = selectedCategory;
if (minPrice !== undefined || maxPrice !== undefined) {
  where.price = {};
  if (minPrice !== undefined) where.price.gte = minPrice;
  if (maxPrice !== undefined) where.price.lte = maxPrice;
}
if (query) {
  where.name = { contains: query, mode: "insensitive" };
}
const [categoryRows, totalProducts] = await Promise.all([
  prisma.product.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  }),
  prisma.product.count({ where }),
]);
const products = await prisma.product.findMany({
  where,
  orderBy: rawSort === "price-desc" ? { price: "desc" } : { price: "asc" },
  take: ITEMS_PER_PAGE,
  skip: (boundedPage - 1) * ITEMS_PER_PAGE,
});
```

**Пояснення:** Спочатку рахуємо `count` і список категорій паралельно, потім — сторінку товарів з `skip`/`take`, щоб номер сторінки з URL не виходив за межі.

**Результат:** запит на кшталт `/catalog?category=Гітари&page=1` повертає HTML із картками товарів і боковою панеллю категорій без окремого REST API для списку.

---

### Етап 3: Кошик без сервера

Поки людина лише складає кошик, база не потрібна: позиції тримаємо в Zustand і дублюємо в `localStorage`. Навіщо — щоб оновити сторінку й не втратити кошик. Оплата й доставка — вже на етапі оформлення.

**Код:**

```ts
// store/cartStore.ts (фрагмент)
export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((c) => c.productId === item.productId);
          if (existingItem) {
            return {
              items: state.items.map((c) =>
                c.productId === item.productId
                  ? { ...c, quantity: c.quantity + (item.quantity ?? 1) }
                  : c,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: item.quantity ?? 1 }] };
        }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "octave-cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
```

**Пояснення:** Той самий товар у кошику не дублюється — збільшується `quantity`. У `localStorage` потрапляють лише `items`, без зайвих полів стора.

**Результат (у браузері, Application → Local Storage):** ключ `octave-cart-storage` з JSON на кшталт `{"state":{"items":[{"productId":"...","name":"...","quantity":2}]},"version":0}`.

---

### Етап 4: Оформлення замовлення — один вхід для форми

Форма на `/checkout` відправляє JSON на `POST /api/checkout`. Там спочатку Zod перевіряє поля (телефон, адреса, список товарів). Потім гілка: або все робить Prisma в одному процесі, або запит іде далі в сервіс замовлень — залежить від змінних середовища.

**Код:**

```ts
// app/api/checkout/route.ts (фрагмент)
const useMs =
  Boolean(process.env.ORDER_SERVICE_URL?.trim()) &&
  Boolean(process.env.SERVICE_INTERNAL_TOKEN?.trim());

if (useMs) {
  // fetch у order-service + Bearer-токен
} else {
  result = await createOrderViaMonolith(...);
}
```

**Пояснення:** Для користувача **одна** кнопка «Підтвердити»; для розробника — вибір: розробка без Docker-мікросервісів (швидше) або повний стек у контейнерах (як на захисті).

**Результат (успішна відповідь API, приклад):** `POST /api/checkout` з валідним тілом повертає JSON на кшталт `{"success":true,"orderId":"..."}` (HTTP 201); при помилці валідації — `{"success":false,"error":"..."}` з HTTP 400.

---

### Етап 5: Вхід покупця й кабінет

Пароль при реєстрації не зберігається відкритим — тільки хеш. Після входу в cookie кладеться підписаний JWT (бібліотека jose), а `middleware` не пускає на `/account` без валідного квитка. Редірект на логін з параметром `next`, щоб після входу повернути туди, куди людина йшла.

**Код:**

```ts
// middleware.ts (фрагмент — кабінет покупця)
if (pathname.startsWith("/account")) {
  const sessionToken = request.cookies.get(USER_COOKIE_NAME)?.value ?? "";
  const session = await verifyUserSessionJwt(sessionToken);
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
```

```ts
// lib/user-session.ts (фрагмент — випуск JWT після логіну)
export async function createUserSessionJwt(userId: string, email: string): Promise<string | null> {
  const key = getUserSigningKeyBytes();
  if (!key) return null;
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}
```

**Пояснення:** Секрет для підпису задається в `.env`; у продакшені його не залишають «як у прикладі» — генерують довгий випадковий рядок.

**Результат:** запит `GET /account` без cookie `user_session` → редірект на `/login?next=%2Faccount`; після успішного входу в DevTools → Application → Cookies з’являється `user_session` (HttpOnly, якщо так налаштовано в server action).

---

### Етап 6: Відгуки

Відгук спочатку потрапляє в статус «на модерацію». На сторінці товару покупець бачить лише схвалені. В адмінці — список очікуючих і кнопки «схвалити / відхилити». Так магазин не перетворюється на дошку оголошень без контролю.

**Код:**

```prisma
// prisma/schema.prisma (фрагмент)
model Review {
  id        String       @id @default(auto()) @map("_id") @db.ObjectId
  productId String       @db.ObjectId
  userId    String       @db.ObjectId
  rating    Int
  text      String
  status    ReviewStatus @default(PENDING)
  product   Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([productId, userId])
  @@index([status])
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
}
```

```ts
// actions/reviewActions.ts (фрагмент — upsert одного відгуку на пару user+product)
await prisma.review.upsert({
  where: { productId_userId: { productId: parsed.data.productId, userId: user.id } },
  create: {
    productId: parsed.data.productId,
    userId: user.id,
    rating: parsed.data.rating,
    text: parsed.data.text,
    status: "PENDING",
  },
  update: {
    rating: parsed.data.rating,
    text: parsed.data.text,
    status: "PENDING",
  },
});
```

**Пояснення:** У схемі Prisma обмеження «один відгук від одного користувача на один товар» не дає наклацати десять однакових текстів; повторна відправка оновлює текст і знову ставить статус на модерацію.

**Результат:** після відправки форми server action повертає `{ success: true }` або `{ success: false, message: "..." }`; у Mongo документ `Review` має `status: "PENDING"` до рішення адміністратора.

---

### Етап 7: Два маленькі сервіси в Docker

Коли Compose піднімає не лише сайт, а й **catalog-service** і **order-service**, вони спілкуються по HTTP усередині мережі Docker. Каталог відповідає: «такі товари є, ось ціни»; замовлення записує замовлення в ту саму Mongo.

Спочатку збирали образи на Alpine — Prisma там часто падала через відсутність потрібної бібліотеки OpenSSL. Перейшли на **Debian bookworm-slim** у Dockerfile мікросервісів: менше сивого волосся при збірці.

**Код:**

```dockerfile
# services/catalog-service/Dockerfile
FROM node:20-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json ./
COPY prisma ./prisma
RUN npm install && npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
ENV NODE_ENV=production
EXPOSE 4001
CMD ["node", "dist/index.js"]
```

```ts
// services/catalog-service/src/index.ts (фрагмент — health + внутрішній маршрут)
app.get("/health", async () => ({ status: "ok", service: "catalog-service" }));

app.post("/internal/validate-checkout-items", async (request, reply) => {
  const token = process.env.SERVICE_INTERNAL_TOKEN;
  if (!requireInternalAuth(request.headers.authorization, token)) {
    return reply.status(401).send({ ok: false, error: "Unauthorized" });
  }
  // ... prisma.product.findMany({ where: { id: { in: uniqueIds } }, ... })
});
```

**Пояснення:** Це не «обов’язкова частина» для локальної розробки; це шар для демонстрації розділення відповідальності й робочого Docker-стеку.

**Результат:** `GET http://localhost:4001/health` (з хоста, якщо порт проброшено) → JSON `{"status":"ok","service":"catalog-service"}`; без заголовка `Authorization: Bearer <SERVICE_INTERNAL_TOKEN>` внутрішній POST повертає `401` з тілом `{"ok":false,"error":"Unauthorized"}`.

---

### Етап 8: Чому після білду зникали товари

Типова ситуація: перезібрали контейнери, Mongo з новим томом — **порожня**. Сайт відкривається, але каталог пустий: не тому що «зламався фронт», а тому що **немає записів** у колекції товарів.

Зробили так: у `docker-compose` з’являється сервіс **db-seed** — після того як Mongo «ожила», він виконує `db push` і сид з демо-товарами. Каталог-сервіс стартує **після** успішного завершення сиду. Плюс у `.env` одна назва бази (`MONGO_DB_NAME`) підставляється всюди, щоб не сидити в одну базу, а читати з іншої.

**Код:**

```yaml
# docker-compose.yml (фрагмент)
db-seed:
  build:
    dockerfile: Dockerfile.seed
  environment:
    DATABASE_URL: mongodb://mongo:27017/${MONGO_DB_NAME:-octave_shop}
  depends_on:
    mongo:
      condition: service_healthy
```

**Пояснення:** Без цього кроку після кожного «чистого» Docker людині доводилось вручну запускати сид з ноутбука — легко забути й вирішити, що «нічого не працює».

**Результат:** після успішного завершення контейнера `db-seed` у логах Compose з’являються рядки на кшталт `The seed command has been executed`; `GET /api/health/db` на веб-контейнері повертає JSON з `"ok": true`, якщо Prisma досягає Mongo з тим самим `DATABASE_URL` / `MONGO_DB_NAME`.

---

### Етап 9: Запуск з Windows

Файл `start.bat` запускає `docker compose up --build`. Текст у ньому **англійською**, не тому що «модно», а тому що **старий cmd.exe** ламає кирилицю в `.bat` і рве команди навпіл — з `docker compose` виходить нісенітниця на кшталт окремої команди `compose`.

**Код:**

```bat
@echo off
setlocal EnableExtensions
cd /d "%~dp0"
where docker >nul 2>nul
if errorlevel 1 (
  echo [ERROR] "docker" not found in PATH.
  exit /b 1
)
docker info >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Docker Engine is not running.
  exit /b 1
)
docker compose version >nul 2>&1
if not errorlevel 1 (
  docker compose up --build
  goto after_compose
)
docker-compose up --build
:after_compose
pause
exit /b 0
```

**Пояснення:** Хто захоче гарні повідомлення українською — можна окремо зробити `start.ps1` для PowerShell; для подвійного кліку по `.bat` надійніше лишити ASCII.

**Результат:** у вікні `cmd` після перевірок з’являється рядок `Using: docker compose - Compose V2`, далі потік логів `docker compose up --build` (побудова образів, `Creating ...`, `Attaching to ...`); після зупинки (Ctrl+C) скрипт доходить до `pause`.

---
