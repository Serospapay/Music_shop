"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type ProductBreadcrumbsProps = {
  category: string;
  productName: string;
};

export function ProductBreadcrumbs({ category, productName }: ProductBreadcrumbsProps) {
  const catalogCategoryHref = `/catalog?category=${encodeURIComponent(category)}`;

  return (
    <nav
      className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-zinc-500"
      aria-label="Навігація по розділах"
    >
      <Link href="/" className="rounded-md px-1.5 py-0.5 transition hover:bg-brand-500/10 hover:text-brand-200">
        Головна
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" strokeWidth={2} aria-hidden />
      <Link href="/catalog" className="rounded-md px-1.5 py-0.5 transition hover:bg-brand-500/10 hover:text-brand-200">
        Каталог
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" strokeWidth={2} aria-hidden />
      <Link
        href={catalogCategoryHref}
        className="rounded-md px-1.5 py-0.5 transition hover:bg-brand-500/10 hover:text-brand-200"
      >
        {category}
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" strokeWidth={2} aria-hidden />
      <span className="max-w-[min(100%,18rem)] truncate rounded-md px-1.5 py-0.5 text-zinc-300 sm:max-w-[28rem]">
        {productName}
      </span>
    </nav>
  );
}
