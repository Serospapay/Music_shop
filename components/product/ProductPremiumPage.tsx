"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@prisma/client";
import { Banknote, CheckCircle2, Headphones, Truck } from "lucide-react";
import { ProductBreadcrumbs } from "@/components/product/ProductBreadcrumbs";
import { ProductQuantityStepper } from "@/components/product/ProductQuantityStepper";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProductCard } from "@/components/ui/ProductCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPriceUah } from "@/lib/format";
import type { ProductSpecRow } from "@/lib/product-specs";
import { parseCompatibilityJson, technicalSpecsForDisplay } from "@/lib/product-json";
import { cn } from "@/lib/utils";
import { SoundRadar, type SoundRadarDatum } from "@/components/ui/SoundRadar";
import { ProductPdpFaq } from "@/components/product/ProductPdpFaq";
import { WishlistToggleButton } from "@/components/product/WishlistToggleButton";
import { TrackRecentlyViewed } from "@/components/product/TrackRecentlyViewed";
import { ProductRecommendationSection } from "@/components/personalization/ProductRecommendationSection";

export type ProductPremiumPageProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    sku: string;
    imageUrl: string;
    imageUrls: string[];
    inStock: boolean;
    stockCount: number;
    warrantyMonths: number;
    highlights: string[];
    technicalSpecs: unknown;
    compatibility: unknown;
    specsLegacy: ProductSpecRow[];
  };
  related: Product[];
  soundProfile?: SoundRadarDatum[];
  recentlyViewed: Product[];
  personalized: {
    wishlistInspired: Product[];
    recommendedForYou: Product[];
  };
  wishlist: {
    canManage: boolean;
    initiallyInWishlist: boolean;
    loginHref: string;
  };
};

export function ProductPremiumPage({
  product,
  related,
  soundProfile,
  recentlyViewed,
  personalized,
  wishlist,
}: ProductPremiumPageProps) {
  const gallery = useMemo(
    () => [product.imageUrl, ...product.imageUrls].filter((u, i, a) => u && a.indexOf(u) === i),
    [product.imageUrl, product.imageUrls],
  );
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const technicalRows = useMemo(
    () => technicalSpecsForDisplay(product.technicalSpecs, product.specsLegacy),
    [product.technicalSpecs, product.specsLegacy],
  );
  const compatibilityRows = useMemo(() => parseCompatibilityJson(product.compatibility), [product.compatibility]);

  const highlights = useMemo(() => {
    const fromDb = product.highlights.map((h) => h.trim()).filter(Boolean);
    if (fromDb.length > 0) {
      return Array.from(new Set(fromDb));
    }
    return technicalRows.slice(0, 6).map((row) => `${row.key}: ${row.value}`);
  }, [product.highlights, technicalRows]);

  const maxOrderQty = product.stockCount > 0 ? Math.min(99, product.stockCount) : 99;
  const canPurchase = product.inStock;
  const addDisabled = !canPurchase || (product.stockCount > 0 && quantity > product.stockCount);

  const cartItem = {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl: product.imageUrl,
    price: product.price,
  };

  return (
    <div className="pb-20 pt-6 sm:pt-8">
      <TrackRecentlyViewed productId={product.id} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-brand-500/10 pb-5">
          <ProductBreadcrumbs category={product.category} productName={product.name} />
        </div>

        <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-4 lg:col-span-7">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-brand-500/15 bg-surface-900">
              <Image
                src={gallery[activeImg] ?? product.imageUrl}
                alt={product.name}
                fill
                unoptimized
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
            </div>
            {gallery.length > 1 ? (
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6">
                {gallery.map((src, idx) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImg(idx)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-xl border-2 transition",
                      idx === activeImg
                        ? "border-brand-400 ring-2 ring-brand-400/30"
                        : "border-transparent opacity-75 hover:opacity-100",
                    )}
                    aria-label={`Фото ${idx + 1}`}
                  >
                    <Image src={src} alt="" fill unoptimized className="object-cover" sizes="120px" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <Card className="rounded-3xl border-brand-500/20 bg-surface-900/95 lg:col-span-5">
            <CardHeader className="space-y-4 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400/95">
                {product.brand.trim() || "Октава"}
              </p>
              <h1 className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">{product.name}</h1>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                    product.inStock
                      ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30"
                      : "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30",
                  )}
                >
                  {product.inStock ? "В наявності" : "Немає в наявності"}
                </span>
                {product.stockCount > 0 ? <span className="text-sm text-zinc-400">Залишок: {product.stockCount} шт.</span> : null}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 px-6 pb-8 sm:px-8">
              <div className="flex items-end gap-3 border-b border-brand-500/10 pb-5">
                <Banknote className="h-9 w-9 shrink-0 text-brand-400/90" strokeWidth={1.25} aria-hidden />
                <div>
                  <h2 className="font-display text-4xl font-semibold tracking-tight text-brand-100 sm:text-[2.7rem]">
                    {formatPriceUah(product.price)}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">SKU: {product.sku}</p>
                </div>
              </div>

              {highlights.length > 0 ? (
                <ul className="space-y-2">
                  {highlights.slice(0, 5).map((point) => (
                    <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-zinc-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="border-t border-brand-500/10 pt-5">
                <ProductQuantityStepper
                  value={quantity}
                  onChange={(n) => setQuantity(Math.min(maxOrderQty, Math.max(1, n)))}
                  disabled={!canPurchase}
                  max={maxOrderQty}
                />
              </div>

              <AddToCartButton item={cartItem} quantity={quantity} disabled={addDisabled} variant="premium" />
              {wishlist.canManage ? (
                <WishlistToggleButton
                  productId={product.id}
                  initialInWishlist={wishlist.initiallyInWishlist}
                  className="w-full"
                />
              ) : (
                <Link
                  href={wishlist.loginHref}
                  className="ui-btn-outline w-full justify-center text-sm font-semibold"
                >
                  Увійдіть, щоб додати у бажане
                </Link>
              )}

              <dl className="space-y-2 rounded-2xl border border-brand-500/12 bg-surface-900/50 p-4">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <dt className="text-zinc-500">Категорія</dt>
                  <dd className="text-zinc-200">{product.category}</dd>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <dt className="text-zinc-500">Гарантія</dt>
                  <dd className="text-zinc-200">{product.warrantyMonths} міс.</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </section>

        <section className="mt-12 lg:mt-14">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-3 w-full justify-start gap-0 sm:flex-wrap">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                Опис
              </TabsTrigger>
              <TabsTrigger value="specs" className="text-xs sm:text-sm">
                Характеристики
              </TabsTrigger>
              <TabsTrigger value="compat" className="text-xs sm:text-sm">
                Сумісність
              </TabsTrigger>
              <TabsTrigger value="delivery" className="text-xs sm:text-sm">
                Доставка
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="rounded-2xl border border-brand-500/12 bg-surface-900/40 p-6 sm:p-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
                <div>
                  <div className="ui-prose-pdp max-w-none">
                    {product.description.split(/\n{2,}/).map((block, i) => (
                      <p key={i} className="mb-4 last:mb-0">
                        {block.trim()}
                      </p>
                    ))}
                  </div>
                  {highlights.length > 5 ? (
                    <div className="mt-6 rounded-2xl border border-brand-500/12 bg-surface-900/45 p-5">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-200">Додатково</h4>
                      <ul className="mt-3 space-y-2">
                        {highlights.slice(5).map((point) => (
                          <li key={`extra-${point}`} className="flex gap-2 text-sm text-zinc-300">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" aria-hidden />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
                {soundProfile && soundProfile.length > 0 ? (
                  <div className="lg:sticky lg:top-24">
                    <SoundRadar data={soundProfile} title="Профіль товару" subtitle="Короткий індикатор за даними каталогу" />
                  </div>
                ) : null}
              </div>
            </TabsContent>

            <TabsContent value="specs" className="rounded-2xl border border-brand-500/12 bg-surface-900/40 p-4 sm:p-6">
              {technicalRows.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[38%] sm:w-[40%]">Параметр</TableHead>
                      <TableHead>Значення</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {technicalRows.map((row, idx) => (
                      <TableRow key={`${row.key}-${idx}`}>
                        <TableCell className="align-top font-medium text-zinc-300">{row.key}</TableCell>
                        <TableCell className="align-top text-zinc-200">{row.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="rounded-xl border border-brand-500/10 bg-surface-900/50 p-6 text-sm text-zinc-400">
                  У базі ще немає характеристик для цього товару.
                </p>
              )}
            </TabsContent>

            <TabsContent value="compat" className="rounded-2xl border border-brand-500/12 bg-surface-900/40 p-6 sm:p-8">
              {compatibilityRows.length > 0 ? (
                <ul className="space-y-4">
                  {compatibilityRows.map((row) => (
                    <li key={row.label} className="flex gap-3 border-b border-brand-500/10 pb-4 last:border-0 last:pb-0">
                      <Headphones className="mt-0.5 h-5 w-5 shrink-0 text-brand-400/80" aria-hidden />
                      <div>
                        <p className="font-medium text-white">{row.label}</p>
                        {row.detail ? <p className="mt-1 text-sm leading-relaxed text-zinc-400">{row.detail}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-relaxed text-zinc-400">Дані про сумісність поки не додані.</p>
              )}
            </TabsContent>

            <TabsContent value="delivery" className="rounded-2xl border border-brand-500/12 bg-surface-900/40 p-6 sm:p-8">
              <ul className="space-y-5">
                <li className="flex gap-4">
                  <Truck className="mt-1 h-6 w-6 shrink-0 text-brand-400" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-base font-semibold text-white">Доставка по Україні</h4>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      Нова Пошта та Укрпошта. Відправка після підтвердження замовлення менеджером.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-brand-400" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-base font-semibold text-white">Гарантія</h4>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      {product.warrantyMonths} міс. з моменту передачі товару. Збережіть номер замовлення.
                    </p>
                  </div>
                </li>
              </ul>
            </TabsContent>
          </Tabs>
        </section>

        <section className="mt-10 lg:mt-12">
          <ProductPdpFaq />
        </section>

        {related.length > 0 ? (
          <section className="mt-14 border-t border-brand-500/10 pt-10 lg:mt-16 lg:pt-12">
            <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">Пов&apos;язані товари</h2>
            <p className="mt-2 text-sm text-zinc-500">Інші позиції з категорії «{product.category}».</p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <div key={p.id} className="h-full">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <ProductRecommendationSection
          title="Нещодавно переглянуті"
          subtitle="Ваші останні відкриті товари для швидкого повернення."
          products={recentlyViewed}
        />

        {wishlist.canManage ? (
          <ProductRecommendationSection
            title="Схожі на збережені у wishlist"
            subtitle="Добірка на основі брендів та категорій ваших збережених товарів."
            products={personalized.wishlistInspired}
          />
        ) : null}

        <ProductRecommendationSection
          title="Рекомендовано для вас"
          subtitle={
            wishlist.canManage
              ? "Підбірка, сформована за вашими інтересами в каталозі."
              : "Релевантні товари, які часто обирають разом із переглянутим."
          }
          products={personalized.recommendedForYou}
        />

        <p className="mt-10 text-center text-xs text-zinc-600">
          <Link href="/catalog" className="text-brand-400 hover:text-brand-300">
            Повернутися до каталогу
          </Link>
        </p>
      </div>
    </div>
  );
}
