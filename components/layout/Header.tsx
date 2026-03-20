import Link from "next/link";
import { CartSheet } from "@/components/cart/CartSheet";
import { Logo } from "@/components/brand/Logo";
import { UserNav } from "@/components/auth/UserNav";
import { MobileNav, type NavItem } from "@/components/layout/MobileNav";
import { getCurrentUser } from "@/lib/user-auth";

const navLinks: NavItem[] = [
  { href: "/", label: "Головна" },
  { href: "/catalog", label: "Каталог" },
  { href: "/about", label: "Про нас" },
];

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-12">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <MobileNav links={navLinks} user={user ? { name: user.name } : null} />
          <Logo className="min-w-0 [&_span]:transition-all [&_span]:duration-300 [&_span]:group-hover:text-brand-200 [&_span]:group-hover:drop-shadow-[0_0_14px_rgba(212,165,116,0.35)]" />
        </div>

        <nav
          className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block"
          aria-label="Головна навігація"
        >
          <ul className="pointer-events-auto flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4 md:gap-6">
          <UserNav user={user} />
          <CartSheet
            triggerClassName="border-white/10 bg-white/[0.06] shadow-none backdrop-blur-sm transition-colors hover:scale-100 hover:border-brand-400/35 hover:bg-white/10 hover:text-white"
            badgeClassName="-right-2 -top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full border border-background bg-brand-500 px-0.5 text-[10px] font-bold leading-none text-surface-950 shadow-sm ring-1 ring-black/30"
          />
        </div>
      </div>
    </header>
  );
}
