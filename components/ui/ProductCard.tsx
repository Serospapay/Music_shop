import Image from "next/image";
import Link from "next/link";
import type { Product } from "@prisma/client";
import { formatPriceUah } from "@/lib/format";

type ProductCardProps = {
  product: Product;
};

/** Візуальна мова як у 3D-каруселі: surface-950, тонкий border, смуга під фото. */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="h-full">
      <Link
        href={`/product/${product.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-950/80 shadow-card transition duration-300 hover:border-brand-400/45 hover:shadow-brand-sm"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover brightness-[0.92] transition duration-500 group-hover:scale-[1.03] group-hover:brightness-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={false}
          />
        </div>

        <div className="flex flex-1 flex-col border-t border-white/[0.05] bg-surface-950/50 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {product.brand.trim() ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-400/90">
                  {product.brand.trim()}
                </p>
              ) : null}
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-zinc-500">{product.category}</p>
            </div>
            <span
              className={`max-w-[5.5rem] shrink-0 rounded-full px-2 py-0.5 text-center text-[9px] font-medium leading-tight ${
                product.inStock
                  ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20"
                  : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/20"
              }`}
            >
              {product.inStock ? "В наявності" : "Немає"}
            </span>
          </div>

          <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-white">{product.name}</h3>

          {product.description.trim() ? (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-500">{product.description}</p>
          ) : null}

          <p className="mt-auto pt-3 text-sm font-semibold text-brand-200">{formatPriceUah(product.price)}</p>
        </div>
      </Link>
    </article>
  );
}
