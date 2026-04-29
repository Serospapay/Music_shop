import Link from "next/link";
import { logoutAdminAction } from "@/actions/adminAuth";
import { prisma } from "@/lib/prisma";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";

export async function AdminSidebar() {
  const [pendingOrders, pendingReviews, outOfStockProducts] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { inStock: false } }),
  ]);

  return (
    <aside className="ui-surface p-4 lg:sticky lg:top-24 lg:h-fit">
      <p className="px-2 pb-4 text-sm font-semibold uppercase tracking-[0.15em] text-brand-400/90">Адмін-панель</p>
      <AdminSidebarNav
        pendingOrders={pendingOrders}
        pendingReviews={pendingReviews}
        outOfStockProducts={outOfStockProducts}
      />
      <div className="mt-4 rounded-xl border border-brand-500/15 bg-surface-900/50 p-3 text-xs text-zinc-400">
        <p>Черга замовлень: {pendingOrders}</p>
        <p className="mt-1">Відгуки на модерації: {pendingReviews}</p>
      </div>
      <form action={logoutAdminAction} className="mt-5">
        <button
          type="submit"
          className="ui-btn-outline w-full"
        >
          Вийти
        </button>
      </form>
    </aside>
  );
}
