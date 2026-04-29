"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPriceUah } from "@/lib/format";

export type RelatedProductDTO = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  inStock: boolean;
  category: string;
};

type ProductRelatedRailProps = {
  products: RelatedProductDTO[];
  category: string;
};

export function ProductRelatedRail({ products, category }: ProductRelatedRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) {
    return null;
  }

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }
    const w = Math.min(el.clientWidth * 0.85, 360);
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  return (
    <section className="border-t border-brand-500/10 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-normal text-white sm:text-2xl">Схожі товари</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
            Категорія «{category}». Свайп або стрілки для перегляду.
          </p>
        </div>
        <div className="hidden gap-1 sm:flex">
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-500/20 bg-surface-900/80 text-zinc-300 transition hover:border-brand-400/40 hover:text-white"
            aria-label="Прокрутити вліво"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-500/20 bg-surface-900/80 text-zinc-300 transition hover:border-brand-400/40 hover:text-white"
            aria-label="Прокрутити вправо"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabIndex={0}
        role="region"
        aria-label="Схожі товари, горизонтальний список"
      >
        {products.map((p, index) => (
          <motion.div
            key={p.id}
            className="w-[min(78vw,260px)] shrink-0 snap-start sm:w-[240px]"
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={`/product/${p.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-950/80 transition duration-300 hover:border-brand-400/40 hover:shadow-brand-sm"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  unoptimized
                  className="object-cover brightness-[0.92] transition duration-500 group-hover:scale-[1.03] group-hover:brightness-105"
                  sizes="260px"
                />
              </div>
              <div className="flex flex-1 flex-col border-t border-white/[0.06] bg-surface-950/50 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 text-[10px] uppercase tracking-[0.18em] text-zinc-500">{p.category}</p>
                  <span
                    className={`max-w-[5.5rem] shrink-0 rounded-full px-2 py-0.5 text-center text-[9px] font-medium leading-tight ${
                      p.inStock
                        ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20"
                        : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/20"
                    }`}
                  >
                    {p.inStock ? "В наявності" : "Немає"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-white">{p.name}</p>
                <p className="mt-auto pt-3 text-sm font-semibold text-brand-200">{formatPriceUah(p.price)}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
