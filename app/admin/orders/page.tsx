import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPriceUah } from "@/lib/format";

const statusLabelMap: Record<string, string> = {
  PENDING: "Нове",
  PAID: "Обробляється",
  SHIPPED: "Відправлено",
  DELIVERED: "Виконано",
  CANCELLED: "Скасовано",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
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

  return (
    <div className="space-y-5">
      <div>
        <p className="ui-page-eyebrow">Адмін / Замовлення</p>
        <h1 className="mt-2 font-display text-3xl font-normal text-white sm:text-4xl">Замовлення</h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Клієнт</TableHead>
            <TableHead>Контакти</TableHead>
            <TableHead>Склад</TableHead>
            <TableHead>Сума</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium text-white">{order.id.slice(-8)}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>
                <p>{order.email}</p>
                <p className="text-zinc-400">{order.phone}</p>
              </TableCell>
              <TableCell className="max-w-[220px] align-top text-xs text-zinc-400">
                <ul className="space-y-1">
                  {order.items.map((line) => (
                    <li key={line.id}>
                      {(line.productName ?? "Товар").trim()} × {line.quantity}{" "}
                      <span className="text-zinc-500">({formatPriceUah(line.price)})</span>
                    </li>
                  ))}
                </ul>
              </TableCell>
              <TableCell>{formatPriceUah(order.totalAmount)}</TableCell>
              <TableCell>
                <span className="inline-flex rounded-full border border-brand-500/20 bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-100">
                  {statusLabelMap[order.status] ?? order.status}
                </span>
              </TableCell>
              <TableCell className="text-zinc-400">
                {order.createdAt.toLocaleString("uk-UA")}
              </TableCell>
            </TableRow>
          ))}

          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-zinc-400">
                Замовлень поки немає.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
