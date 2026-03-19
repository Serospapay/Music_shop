import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-brand-500/10 bg-surface-950/90">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-zinc-400 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-md space-y-2">
          <p className="font-display text-lg text-brand-200">Октава</p>
          <p className="leading-relaxed text-zinc-400">
            Каталог музичних інструментів і студійного обладнання. Ціни та описи на сайті; замовлення — через кошик і
            форму оформлення.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-zinc-500 lg:text-right">
          <Link href="/catalog" className="text-zinc-400 transition hover:text-brand-200">
            Каталог
          </Link>
          <Link href="/about" className="text-zinc-400 transition hover:text-brand-200">
            Про нас
          </Link>
          <p className="pt-2 text-xs text-zinc-600">
            © {new Date().getFullYear()} Октава. Усі права захищено.
          </p>
        </div>
      </div>
    </footer>
  );
}
