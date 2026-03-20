import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { formatPriceUah } from "@/lib/format";

export const metadata: Metadata = {
  title: "Мій кабінет",
  description: "Історія замовлень та дані акаунту.",
};

const statusLabels: Record<string, string> = {
  PENDING: "Очікує",
  PAID: "Оплачено",
  SHIPPED: "Відправлено",
  DELIVERED: "Доставлено",
  CANCELLED: "Скасовано",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/account");
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        orderBy: { id: "asc" },
      },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">Мій кабінет</h1>
        <p className="mt-2 text-sm text-zinc-400">
          {user.name} · {user.email}
        </p>
      </div>

      <section className="ui-surface p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-white">Історія покупок</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Показано замовлення, оформлені під цим акаунтом (email у формі збігався з email профілю).
        </p>

        {orders.length === 0 ? (
          <p className="mt-8 text-sm text-zinc-400">
            Поки немає замовлень.{" "}
            <Link href="/catalog" className="font-medium text-brand-300 hover:text-brand-200">
              Перейти в каталог
            </Link>
          </p>
        ) : (
          <ul className="mt-8 space-y-6">
            {orders.map((order) => (
              <li key={order.id} className="rounded-2xl border border-brand-500/10 bg-surface-900/50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-zinc-500">№ {order.id}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {new Date(order.createdAt).toLocaleString("uk-UA", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-200">
                      {statusLabels[order.status] ?? order.status}
                    </span>
                    <p className="mt-2 text-lg font-semibold tabular-nums text-brand-100">
                      {formatPriceUah(order.totalAmount)}
                    </p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 border-t border-brand-500/10 pt-4">
                  {order.items.map((line) => (
                    <li key={line.id} className="flex flex-wrap justify-between gap-2 text-sm">
                      <span className="text-zinc-300">{line.productName ?? "Товар"}</span>
                      <span className="text-zinc-500">
                        ×{line.quantity} · {formatPriceUah(line.price * line.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
