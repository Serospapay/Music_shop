"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductBreadcrumbs } from "@/components/product/ProductBreadcrumbs";
import { ProductDescriptionExpandable } from "@/components/product/ProductDescriptionExpandable";
import { ProductHeroMedia } from "@/components/product/ProductHeroMedia";
import { ProductRelatedRail, type RelatedProductDTO } from "@/components/product/ProductRelatedRail";
import { ProductServiceHighlights } from "@/components/product/ProductServiceHighlights";
import { ProductShareAndCatalog } from "@/components/product/ProductShareAndCatalog";
import { ProductStickyMobileCTA } from "@/components/product/ProductStickyMobileCTA";
import { formatPriceUah } from "@/lib/format";

export type ProductPDPProductDTO = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
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
    transition: { staggerChildren: 0.07, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export function ProductPDPExperience({ product, related, siteOrigin }: ProductPDPExperienceProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const productUrl = `${siteOrigin.replace(/\/$/, "")}/product/${product.slug}`;
  const listed = new Date(product.createdAt).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <ProductStickyMobileCTA
        sentinelRef={sentinelRef}
        productName={product.name}
        price={product.price}
        inStock={product.inStock}
        cartItem={cartItemFrom(product)}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <ProductBreadcrumbs category={product.category} productName={product.name} />

        <motion.div
          className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div className="space-y-0 lg:col-span-7" variants={item}>
            <ProductHeroMedia imageUrl={product.imageUrl} productName={product.name} />
            <div ref={sentinelRef} className="h-px w-full" aria-hidden />
          </motion.div>

          <motion.aside
            className="ui-surface flex flex-col p-6 sm:p-8 lg:col-span-5 lg:sticky lg:top-24 lg:self-start"
            variants={item}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-brand-500/80">{product.category}</p>
            <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-white sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-semibold tracking-tight text-brand-100 sm:text-4xl">
                {formatPriceUah(product.price)}
              </span>
              <span className="text-sm text-zinc-500">за даними каталогу на сьогодні</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                  product.inStock
                    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25"
                    : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/25"
                }`}
              >
                {product.inStock ? "В наявності" : "Немає в наявності"}
              </span>
              <span className="text-xs text-zinc-500">У каталозі з {listed}</span>
            </div>

            <div className="mt-8">
              <AddToCartButton item={cartItemFrom(product)} disabled={!product.inStock} />
            </div>

            <ProductShareAndCatalog category={product.category} absoluteProductUrl={productUrl} />
          </motion.aside>
        </motion.div>

        <ProductDescriptionExpandable text={product.description} />

        <ProductRelatedRail products={related} category={product.category} />

        <ProductServiceHighlights />
      </div>
    </>
  );
}
