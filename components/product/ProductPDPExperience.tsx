"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductBreadcrumbs } from "@/components/product/ProductBreadcrumbs";
import { ProductCommerceTrust } from "@/components/product/ProductCommerceTrust";
import { ProductDeliveryCard } from "@/components/product/ProductDeliveryCard";
import { ProductDescriptionExpandable } from "@/components/product/ProductDescriptionExpandable";
import { ProductHeroMedia } from "@/components/product/ProductHeroMedia";
import { ProductPdpFaq } from "@/components/product/ProductPdpFaq";
import { ProductQuantityStepper } from "@/components/product/ProductQuantityStepper";
import { ProductRelatedRail, type RelatedProductDTO } from "@/components/product/ProductRelatedRail";
import { ProductServiceHighlights } from "@/components/product/ProductServiceHighlights";
import { ProductShareAndCatalog } from "@/components/product/ProductShareAndCatalog";
import { ProductSpecsPanel } from "@/components/product/ProductSpecsPanel";
import { ProductStickyMobileCTA } from "@/components/product/ProductStickyMobileCTA";
import type { ProductSpecRow } from "@/lib/product-specs";
import { formatPriceUah } from "@/lib/format";

export type ProductPDPProductDTO = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  sku: string;
  highlights: string[];
  specs: ProductSpecRow[];
  warrantyMonths: number;
  imageUrl: string;
  imageUrls: string[];
  inStock: boolean;
  createdAt: string;
};

type ProductPDPExperienceProps = {
  product: ProductPDPProductDTO;
  related: RelatedProductDTO[];
  siteOrigin: string;
};

const cartItemFrom = (p: ProductPDPProductDTO) => ({
  productId: p.id,
  name: p.name,
  slug: p.slug,
  imageUrl: p.imageUrl,
  price: p.price,
});

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

export function ProductPDPExperience({ product, related, siteOrigin }: ProductPDPExperienceProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(1);
  const productUrl = `${siteOrigin.replace(/\/$/, "")}/product/${product.slug}`;
  const listed = new Date(product.createdAt).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const galleryImages = useMemo(() => {
    return [product.imageUrl, ...product.imageUrls].filter(Boolean);
  }, [product.imageUrl, product.imageUrls]);

  const brandLine = product.brand.trim();
  const highlights = product.highlights.filter(Boolean);

  return (
    <>
      <ProductStickyMobileCTA
        sentinelRef={sentinelRef}
        productName={product.name}
        price={product.price}
        inStock={product.inStock}
        cartItem={cartItemFrom(product)}
        quantity={quantity}
      />

      <article className="relative">
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8 lg:pb-20">
          <div className="mb-6 border-b border-brand-500/10 pb-5">
            <ProductBreadcrumbs category={product.category} productName={product.name} />
          </div>

          <motion.div
            className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div className="min-w-0 space-y-4 lg:col-span-7" variants={item}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-500/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-brand-200">
                  {product.category}
                </span>
                {brandLine ? (
                  <Link
                    href={`/catalog?category=${encodeURIComponent(product.category)}`}
                    className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium uppercase tracking-wide text-zinc-400 transition hover:bg-brand-500/15 hover:text-brand-100"
                  >
                    {brandLine}
                  </Link>
                ) : null}
              </div>
              <ProductHeroMedia images={galleryImages} productName={product.name} />
              <div ref={sentinelRef} className="h-px w-full" aria-hidden />
            </motion.div>

            <motion.aside
              className="min-w-0 space-y-8 lg:col-span-5 lg:sticky lg:top-24 lg:self-start"
              variants={item}
            >
              <header className="space-y-3">
                <h1 className="font-display text-2xl font-normal leading-tight tracking-tight text-white sm:text-3xl lg:text-[2rem]">
                  {product.name}
                </h1>
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-zinc-400">
                  <span>
                    Артикул <span className="font-mono text-zinc-200">{product.sku}</span>
                  </span>
                  <span className="text-zinc-600" aria-hidden>
                    ·
                  </span>
                  <span>у каталозі з {listed}</span>
                </p>
              </header>

              {highlights.length > 0 ? (
                <ul className="space-y-2.5 border-l-2 border-brand-500/30 pl-4">
                  {highlights.map((h) => (
                    <li key={h} className="text-[15px] leading-relaxed text-zinc-300">
                      {h}
                    </li>
                  ))}
                </ul>
              ) : null}

              {/* Один купівельний блок — без вкладеної «коробки в коробці» */}
              <div className="space-y-6 rounded-2xl border border-brand-500/20 bg-surface-900/90 p-5 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Ціна з ПДВ</p>
                    <p className="mt-1 font-display text-3xl font-normal tracking-tight text-brand-100 sm:text-4xl">
                      {formatPriceUah(product.price)}
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                      Підстави для ПДВ — згідно з чинним законодавством (за наявності).
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                      product.inStock
                        ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/25"
                        : "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/25"
                    }`}
                  >
                    {product.inStock ? "В наявності" : "Немає в наявності"}
                  </span>
                </div>

                <div className="h-px w-full bg-brand-500/15" />

                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <ProductQuantityStepper
                    value={quantity}
                    onChange={setQuantity}
                    disabled={!product.inStock}
                  />
                </div>

                <AddToCartButton
                  item={cartItemFrom(product)}
                  quantity={quantity}
                  disabled={!product.inStock}
                />
              </div>

              <div className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Умови та сервіс</h2>
                <ProductCommerceTrust warrantyMonths={product.warrantyMonths} />
              </div>

              <div className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Поділитися</h2>
                <ProductShareAndCatalog category={product.category} absoluteProductUrl={productUrl} />
              </div>
            </motion.aside>
          </motion.div>

          {/* Нижня зона: менший розрив від героя, єдиний ритм */}
          <div className="mt-10 space-y-10 border-t border-brand-500/10 pt-10 lg:mt-12 lg:space-y-12 lg:pt-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
              <div className="flex min-w-0 flex-col gap-8 lg:col-span-7 lg:gap-10">
                <ProductDescriptionExpandable text={product.description} />
                <ProductSpecsPanel rows={product.specs} />
              </div>
              <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
                <ProductDeliveryCard />
              </div>
            </div>

            <ProductPdpFaq />

            <ProductRelatedRail products={related} category={product.category} />

            <ProductServiceHighlights />
          </div>
        </div>
      </article>
    </>
  );
}
