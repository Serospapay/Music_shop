import Link from "next/link";
import { CartSheet } from "@/components/cart/CartSheet";
import { Logo } from "@/components/brand/Logo";
import { MobileNav, type NavItem } from "@/components/layout/MobileNav";

const navLinks: NavItem[] = [
  { href: "/", label: "Головна" },
  { href: "/catalog", label: "Каталог" },
  { href: "/about", label: "Про нас" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-500/10 bg-surface-950/75 backdrop-blur-xl supports-[backdrop-filter]:bg-surface-950/65">
      <div className="mx-auto grid h-[4.5rem] w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 justify-self-start sm:gap-3">
          <MobileNav links={navLinks} />
          <Logo className="min-w-0" />
        </div>

        <nav
          className="hidden items-center justify-center gap-8 md:flex md:px-4"
          aria-label="Головна навігація"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-zinc-400 transition hover:text-brand-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex justify-self-end">
          <CartSheet />
        </div>
      </div>
    </header>
  );
}
