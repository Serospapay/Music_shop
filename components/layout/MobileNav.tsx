"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export type NavItem = { href: string; label: string };

type MobileNavProps = {
  links: NavItem[];
  user?: { name: string } | null;
};

export function MobileNav({ links, user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="flex md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/20 bg-surface-850/80 text-zinc-200 transition hover:border-brand-400/40 hover:bg-surface-800 hover:text-white"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        aria-label="Відкрити меню"
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-surface-950/97 backdrop-blur-xl"
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Навігація"
        >
          <div className="flex items-center justify-between border-b border-brand-500/15 px-4 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-400/90">Меню</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/20 text-zinc-300 transition hover:border-brand-400/40 hover:text-brand-100"
              aria-label="Закрити меню"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-4 py-3.5 text-base font-medium transition ${
                    active
                      ? "bg-brand-500/15 text-brand-200"
                      : "text-zinc-200 hover:bg-surface-800 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-6 border-t border-brand-500/15 pt-6">
              {user ? (
                <>
                  <p className="px-4 pb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Акаунт
                  </p>
                  <Link
                    href="/account"
                    className="block rounded-xl px-4 py-3.5 text-base font-medium text-zinc-200 transition hover:bg-surface-800 hover:text-white"
                  >
                    Мій кабінет ({user.name})
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block rounded-xl px-4 py-3.5 text-base font-medium text-zinc-200 transition hover:bg-surface-800 hover:text-white"
                  >
                    Увійти
                  </Link>
                  <Link
                    href="/register"
                    className="mt-1 block rounded-xl px-4 py-3.5 text-base font-medium text-brand-200 transition hover:bg-surface-800"
                  >
                    Реєстрація
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
