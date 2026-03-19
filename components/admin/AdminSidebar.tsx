import Link from "next/link";
import { logoutAdminAction } from "@/actions/adminAuth";

const links = [
  { href: "/admin", label: "Дашборд" },
  { href: "/admin/products", label: "Товари" },
  { href: "/admin/orders", label: "Замовлення" },
];

export function AdminSidebar() {
  return (
    <aside className="ui-surface p-4 lg:sticky lg:top-24 lg:h-fit">
      <p className="px-2 pb-4 text-sm font-semibold uppercase tracking-[0.15em] text-brand-400/90">Адмін-панель</p>
      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition-all hover:bg-surface-800 hover:text-brand-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
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
