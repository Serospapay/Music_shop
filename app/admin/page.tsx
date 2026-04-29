import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPriceUah } from "@/lib/format";

export const revalidate = 0;
export const fetchCache = "force-no-store";

function isBlockedOrderRecord(order: { customerName: string; email: string; phone: string; address: string }) {
  const haystack = `${order.customerName} ${order.email} ${order.phone} ${order.address}`.toLowerCase();
  return (
    haystack.includes("осадчук") ||
    haystack.includes("serh") ||
    haystack.includes("osadchuk") ||
    haystack.includes("papayosadchuk") ||
    haystack.includes("+380506503835")
  );
}

export default async function AdminDashboardPage() {
  noStore();

  const [
    productsCount,
    ordersCount,
    pendingOrdersCount,
    pendingReviewsCount,
    lowStockProductsCount,
    salesAggregate,
    latestPendingOrders,
    lowStockProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { inStock: true, stockCount: { lte: 5 } } }),
    prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.order.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        items: {
          select: { quantity: true, productName: true },
        },
      },
    }),
    prisma.product.findMany({
      where: { inStock: true, stockCount: { lte: 5 } },
      orderBy: { stockCount: "asc" },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        stockCount: true,
        category: true,
      },
    }),
  ]);

  const totalSales = Number(salesAggregate._sum.totalAmount ?? 0);
  const visiblePendingOrders = latestPendingOrders.filter((order) => !isBlockedOrderRecord(order));
  const visiblePendingCount = pendingOrdersCount - (latestPendingOrders.length - visiblePendingOrders.length);

  return (
    <div className="space-y-6">
      <div>
        <p className="ui-page-eyebrow">Дашборд</p>
        <h1 className="mt-2 font-display text-3xl font-normal text-white sm:text-4xl">Аналітика магазину</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Оперативна панель: черга замовлень, модерація відгуків та контроль залишків.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Загальна кількість товарів</CardDescription>
            <CardTitle>{productsCount}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-zinc-400">Усі активні позиції каталогу.</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Кількість замовлень</CardDescription>
            <CardTitle>{ordersCount}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-zinc-400">Усі оформлені замовлення клієнтів.</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Загальна сума продажів</CardDescription>
            <CardTitle>{formatPriceUah(totalSales)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-zinc-400">
            Підсумок по полю totalAmount з бази даних.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Нові до обробки</CardDescription>
            <CardTitle>{Math.max(visiblePendingCount, 0)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-zinc-400">
            Замовлення у статусі &quot;Нове&quot;, вже передані адміну в чергу.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Відгуки на модерації</CardDescription>
            <CardTitle>{pendingReviewsCount}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-zinc-400">
            Потребують перевірки перед публікацією на сторінці товару.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Низький залишок</CardDescription>
            <CardTitle>{lowStockProductsCount}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-zinc-400">
            Товари з залишком до 5 шт., які треба поповнити.
          </CardContent>
        </Card>
      </div>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Останні нові замовлення</CardTitle>
            <CardDescription>Пріоритетна черга для старту обробки.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {visiblePendingOrders.length === 0 ? (
              <p className="text-sm text-zinc-400">Нових замовлень у черзі немає.</p>
            ) : (
              visiblePendingOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-brand-500/15 bg-surface-900/50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-zinc-100">#{order.id.slice(-8)} · {order.customerName}</p>
                    <p className="text-xs text-zinc-500">
                      {order.createdAt.toLocaleString("uk-UA", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{order.email} · {order.phone}</p>
                  <p className="mt-1 text-xs text-zinc-500 line-clamp-1">{order.address}</p>
                </div>
              ))
            )}
            <Link href="/admin/orders?status=PENDING" className="ui-btn-outline-compact">
              Відкрити чергу замовлень
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Товари з низьким залишком</CardTitle>
            <CardDescription>Швидкий контроль позицій, що скоро закінчаться.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-zinc-400">Критичних залишків немає.</p>
            ) : (
              lowStockProducts.map((product) => (
                <div key={product.id} className="rounded-xl border border-brand-500/15 bg-surface-900/50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-zinc-100">{product.name}</p>
                    <p className="text-xs text-amber-300">Залишок: {product.stockCount}</p>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">{product.category}</p>
                  <Link
                    href={`/product/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex text-xs text-brand-300 hover:text-brand-200"
                  >
                    Відкрити картку товару
                  </Link>
                </div>
              ))
            )}
            <Link href="/admin/products?stock=low" className="ui-btn-outline-compact">
              Керувати залишками
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
