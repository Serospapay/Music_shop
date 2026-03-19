import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPriceUah } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [productsCount, ordersCount, salesAggregate] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
    }),
  ]);

  const totalSales = Number(salesAggregate._sum.totalAmount ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="ui-page-eyebrow">Дашборд</p>
        <h1 className="mt-2 font-display text-3xl font-normal text-white sm:text-4xl">Аналітика магазину</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
      </div>
    </div>
  );
}
