import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPriceUah } from "@/lib/format";
import { AdminOrderStatusControl } from "@/components/admin/AdminOrderStatusControl";
import { DELIVERY_METHOD_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/checkout-options";

const statusLabelMap: Record<string, string> = {
  PENDING: "Нове",
  PAID: "Обробляється",
  SHIPPED: "Відправлено",
  DELIVERED: "Виконано",
  CANCELLED: "Скасовано",
};

type AdminOrdersPageProps = {
  searchParams?: {
    q?: string;
    status?: string;
    page?: string;
  };
};

const statusOptions = ["all", "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
type StatusOption = (typeof statusOptions)[number];

function toPage(value?: string) {
  const n = Number(value ?? "1");
  if (!Number.isFinite(n) || n <= 0) {
    return 1;
  }
  return Math.floor(n);
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const ITEMS_PER_PAGE = 20;
  const q = searchParams?.q?.trim() ?? "";
  const status: StatusOption =
    searchParams?.status && statusOptions.includes(searchParams.status as StatusOption)
      ? (searchParams.status as StatusOption)
      : "all";
  const requestedPage = toPage(searchParams?.page);

  const where: Prisma.OrderWhereInput = {};
  if (status !== "all") {
    where.status = status;
  }
  if (q) {
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
    ];
  }

  const [totalOrders, pendingCount, paidCount, shippedCount, completedCount, cancelledCount] =
    await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.count({ where: { status: "SHIPPED" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
    ]);

  const totalPages = Math.max(1, Math.ceil(totalOrders / ITEMS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);

  const orders = await prisma.order.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    include: {
      items: {
        select: {
          id: true,
          productName: true,
          quantity: true,
          price: true,
        },
      },
    },
  });
  const queuedOrders = orders.filter((order) => order.status === "PENDING").slice(0, 6);
  const hasFilters = Boolean(q || status !== "all");
  const makePageHref = (page: number) => {
    const params = new URLSearchParams();
    if (q) {
      params.set("q", q);
    }
    if (status !== "all") {
      params.set("status", status);
    }
    params.set("page", String(page));
    return `/admin/orders?${params.toString()}`;
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="ui-page-eyebrow">Адмін / Замовлення</p>
        <h1 className="mt-2 font-display text-3xl font-normal text-white sm:text-4xl">Замовлення</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Жива черга обробки: пошук по клієнту/контактам, фільтр статусів, оперативне оновлення замовлення.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="ui-surface-inset p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Нове</p>
          <p className="mt-2 text-2xl font-semibold text-amber-200">{pendingCount}</p>
        </div>
        <div className="ui-surface-inset p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Обробляється</p>
          <p className="mt-2 text-2xl font-semibold text-sky-200">{paidCount}</p>
        </div>
        <div className="ui-surface-inset p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Відправлено</p>
          <p className="mt-2 text-2xl font-semibold text-indigo-200">{shippedCount}</p>
        </div>
        <div className="ui-surface-inset p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Виконано</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-200">{completedCount}</p>
        </div>
        <div className="ui-surface-inset p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Скасовано</p>
          <p className="mt-2 text-2xl font-semibold text-rose-200">{cancelledCount}</p>
        </div>
      </section>

      <section className="ui-surface p-4 sm:p-5">
        <form method="get" className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr,220px,auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            className="ui-input"
            placeholder="Пошук: ID, клієнт, email, телефон, адреса"
          />
          <select
            name="status"
            defaultValue={status}
            className="ui-input"
            aria-label="Фільтр статусу замовлень"
          >
            <option value="all">Усі статуси</option>
            <option value="PENDING">Нове</option>
            <option value="PAID">Обробляється</option>
            <option value="SHIPPED">Відправлено</option>
            <option value="DELIVERED">Виконано</option>
            <option value="CANCELLED">Скасовано</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="ui-btn-primary-compact h-[42px] px-4">
              Застосувати
            </button>
            {hasFilters ? (
              <Link href="/admin/orders" className="ui-btn-outline-compact h-[42px] px-4">
                Скинути
              </Link>
            ) : null}
          </div>
        </form>
        <p className="mt-3 text-sm text-zinc-400">
          Показано: <span className="font-semibold text-zinc-200">{totalOrders}</span>
          {hasFilters ? " за активними фільтрами." : " замовлень."}
        </p>
      </section>

      <section className="rounded-2xl border border-brand-500/15 bg-surface-900/55 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-300">Черга на обробку</p>
        {queuedOrders.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            {queuedOrders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>#{order.id.slice(-8)} · {order.customerName}</span>
                <span className="text-zinc-500">{order.createdAt.toLocaleString("uk-UA")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">Наразі нових заявок у черзі немає.</p>
        )}
      </section>

      <Table tableClassName="md:min-w-[1120px]">
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Клієнт / Контакти</TableHead>
            <TableHead>Доставка / Оплата</TableHead>
            <TableHead>Сума</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Склад</TableHead>
            <TableHead>Дата / Черга</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const positionsCount = order.items.length;
            const unitsCount = order.items.reduce((sum, line) => sum + line.quantity, 0);
            const previewLines = order.items.slice(0, 3);

            return (
              <TableRow key={order.id}>
                <TableCell className="font-medium text-white">{order.id.slice(-8)}</TableCell>
                <TableCell>
                  <p className="font-medium text-zinc-100">{order.customerName}</p>
                  <p className="mt-1 text-xs text-zinc-400">{order.email}</p>
                  <p className="text-xs text-zinc-500">{order.phone}</p>
                  {order.customerComment?.trim() ? (
                    <p className="mt-2 line-clamp-2 text-xs text-zinc-500">Коментар: {order.customerComment}</p>
                  ) : null}
                </TableCell>
                <TableCell className="max-w-[260px]">
                  <p className="text-sm text-zinc-200">
                    {order.deliveryMethod ? DELIVERY_METHOD_LABELS[order.deliveryMethod] : "Не вказано"}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {order.paymentMethod ? PAYMENT_METHOD_LABELS[order.paymentMethod] : "Не вказано"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{order.address}</p>
                </TableCell>
                <TableCell>
                  <p className="font-semibold text-zinc-100">{formatPriceUah(order.totalAmount)}</p>
                  <p className="text-xs text-zinc-500">Доставка: {formatPriceUah(order.deliveryFee ?? 0)}</p>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <span className="inline-flex rounded-full border border-brand-500/20 bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-100">
                      {statusLabelMap[order.status] ?? order.status}
                    </span>
                    <AdminOrderStatusControl orderId={order.id} status={order.status} />
                  </div>
                </TableCell>
                <TableCell className="max-w-[260px] align-top">
                  <p className="text-xs font-medium text-zinc-300">
                    {positionsCount} позицій · {unitsCount} шт.
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-zinc-500">
                    {previewLines.map((line) => (
                      <li key={line.id} className="line-clamp-1">
                        {(line.productName ?? "Товар").trim()} × {line.quantity}
                      </li>
                    ))}
                  </ul>
                  {order.items.length > previewLines.length ? (
                    <details className="mt-2 rounded-lg border border-brand-500/15 bg-surface-900/50 p-2">
                      <summary className="cursor-pointer text-xs font-medium text-brand-300 hover:text-brand-200">
                        Показати весь склад
                      </summary>
                      <ul className="mt-2 max-h-40 space-y-1 overflow-auto pr-1 text-xs text-zinc-400">
                        {order.items.map((line) => (
                          <li key={`full-${line.id}`}>
                            {(line.productName ?? "Товар").trim()} × {line.quantity} · {formatPriceUah(line.price)}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </TableCell>
                <TableCell className="text-zinc-400">
                  <p>{order.createdAt.toLocaleString("uk-UA")}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {order.adminQueuedAt
                      ? `У черзі: ${order.adminQueuedAt.toLocaleString("uk-UA")}`
                      : "Черга: автоматично"}
                  </p>
                </TableCell>
              </TableRow>
            );
          })}

          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-zinc-400">
                Замовлень поки немає.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
          <p>
            Сторінка <span className="font-semibold text-zinc-200">{currentPage}</span> з{" "}
            <span className="font-semibold text-zinc-200">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Link
              href={makePageHref(Math.max(1, currentPage - 1))}
              className={`ui-btn-outline-compact ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              Назад
            </Link>
            <Link
              href={makePageHref(Math.min(totalPages, currentPage + 1))}
              className={`ui-btn-outline-compact ${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}`}
            >
              Вперед
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
