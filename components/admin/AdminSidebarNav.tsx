"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LayoutDashboard, MessageSquareWarning, PackageSearch, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

type AdminSidebarNavProps = {
  pendingOrders: number;
  pendingReviews: number;
  outOfStockProducts: number;
};

const baseLinks: SidebarLink[] = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Замовлення", icon: ClipboardList },
  { href: "/admin/products", label: "Товари", icon: PackageSearch },
  { href: "/admin/reviews", label: "Відгуки", icon: MessageSquareWarning },
];

export function AdminSidebarNav({
  pendingOrders,
  pendingReviews,
  outOfStockProducts,
}: AdminSidebarNavProps) {
  const pathname = usePathname();
  const links: SidebarLink[] = baseLinks.map((link) => {
    if (link.href === "/admin/orders") {
      return { ...link, badge: pendingOrders };
    }
    if (link.href === "/admin/reviews") {
      return { ...link, badge: pendingReviews };
    }
    if (link.href === "/admin/products") {
      return { ...link, badge: outOfStockProducts };
    }
    return link;
  });

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const active =
          pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`));
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "border-brand-400/45 bg-brand-500/10 text-brand-100"
                : "border-transparent text-zinc-200 hover:border-brand-500/25 hover:bg-surface-800 hover:text-brand-100",
            )}
          >
            <span className="inline-flex items-center gap-2">
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              {link.label}
            </span>
            {typeof link.badge === "number" && link.badge > 0 ? (
              <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-brand-400/35 bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand-100">
                {link.badge > 99 ? "99+" : link.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
