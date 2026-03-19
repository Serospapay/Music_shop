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
      className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-zinc-500"
      aria-label="Навігація по розділах"
    >
      <Link href="/" className="transition hover:text-brand-200">
        Головна
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-45" strokeWidth={2} aria-hidden />
      <Link href="/catalog" className="transition hover:text-brand-200">
        Каталог
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-45" strokeWidth={2} aria-hidden />
      <Link href={catalogCategoryHref} className="transition hover:text-brand-200">
        {category}
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-45" strokeWidth={2} aria-hidden />
      <span className="max-w-[min(100%,14rem)] truncate text-zinc-400 md:max-w-[24rem]">{productName}</span>
    </nav>
  );
}
