"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@prisma/client";
import {
  Banknote,
  Headphones,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";
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
    technicalSpecs: unknown;
    compatibility: unknown;
    specsLegacy: ProductSpecRow[];
  };
  related: Product[];
  /** Демо звукового профілю (radar); згодом можна замінити даними з БД */
  soundProfile?: SoundRadarDatum[];
};

export function ProductPremiumPage({ product, related, soundProfile }: ProductPremiumPageProps) {
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

  const compatibilityRows = useMemo(
    () => parseCompatibilityJson(product.compatibility),
    [product.compatibility],
  );

  const maxOrderQty = product.stockCount > 0 ? Math.min(99, product.stockCount) : 99;
  const canPurchase = product.inStock;
  const showAvailabilityBadge = product.stockCount > 0 || (product.inStock && product.stockCount === 0);
  const addDisabled =
    !canPurchase || (product.stockCount > 0 && quantity > product.stockCount);

  const cartItem = {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl: product.imageUrl,
    price: product.price,
  };

  return (
    <div className="pb-20 pt-6 sm:pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-brand-500/10 pb-6">
          <ProductBreadcrumbs category={product.category} productName={product.name} />
        </div>

        {/* Hero */}
        <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="min-w-0 space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-brand-500/15 bg-surface-900 shadow-2xl ring-1 ring-white/[0.04]">
              <Image
                src={gallery[activeImg] ?? product.imageUrl}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {gallery.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {gallery.map((src, idx) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImg(idx)}
                    className={cn(
                      "relative h-16 w-16 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-20",
                      idx === activeImg
                        ? "border-brand-400 ring-2 ring-brand-400/30"
                        : "border-transparent opacity-75 hover:opacity-100",
                    )}
                    aria-label={`Фото ${idx + 1}`}
                  >
                    <Image src={src} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <Card className="rounded-3xl border-brand-500/20 bg-surface-900/95 p-0 shadow-2xl ring-1 ring-brand-500/10 backdrop-blur-md">
            <CardHeader className="space-y-4 p-6 sm:p-8 sm:pb-6">
              {product.brand.trim() ? (
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-400/95">{product.brand}</p>
              ) : (
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Октава</p>
              )}
              <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[2.35rem]">
                {product.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                {showAvailabilityBadge ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200 ring-1 ring-emerald-500/30">
                    В наявності
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-200 ring-1 ring-rose-500/30">
                    Немає в наявності
                  </span>
                )}
                {product.stockCount > 0 ? (
                  <span className="text-sm text-zinc-400">Залишок: {product.stockCount} шт.</span>
                ) : null}
                <span className="font-mono text-xs text-zinc-500">SKU {product.sku}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 px-6 pb-8 pt-2 sm:px-8">
              <div className="flex flex-wrap items-end gap-4 border-b border-brand-500/10 pb-8">
                <div className="flex min-w-0 flex-1 items-end gap-3">
                  <Banknote className="h-10 w-10 shrink-0 text-brand-400/90" strokeWidth={1.25} aria-hidden />
                  <div>
                    <h2 className="font-display text-4xl font-semibold tracking-tight text-brand-100 sm:text-5xl">
                      {formatPriceUah(product.price)}
                    </h2>
                    <p className="mt-2 inline-flex rounded-md bg-brand-500/10 px-2 py-1 text-xs font-medium text-brand-200/90">
                      Ціна з ПДВ (за наявності підстав)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <ProductQuantityStepper
                  value={quantity}
                  onChange={(n) => setQuantity(Math.min(maxOrderQty, Math.max(1, n)))}
                  disabled={!canPurchase}
                  max={maxOrderQty}
                />
              </div>

              <AddToCartButton item={cartItem} quantity={quantity} disabled={addDisabled} variant="premium" />
            </CardContent>
          </Card>
        </section>

        {/* Переваги — 3 колонки */}
        <section className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5 lg:mt-12">
          <div className="flex flex-col rounded-2xl border border-brand-500/12 bg-surface-900/50 p-5 sm:p-6">
            <Truck className="h-7 w-7 text-brand-400" strokeWidth={1.5} aria-hidden />
            <h3 className="mt-4 text-base font-semibold text-white">Доставка по Україні</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Нова Пошта та Укрпошта. Відправка після підтвердження замовлення менеджером.
            </p>
          </div>
          <div className="flex flex-col rounded-2xl border border-brand-500/12 bg-surface-900/50 p-5 sm:p-6">
            <ShieldCheck className="h-7 w-7 text-brand-400" strokeWidth={1.5} aria-hidden />
            <h3 className="mt-4 text-base font-semibold text-white">Гарантія офіційна</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {product.warrantyMonths} міс. з моменту передачі товару. Зберігайте номер замовлення та документи.
            </p>
          </div>
          <div className="flex flex-col rounded-2xl border border-brand-500/12 bg-surface-900/50 p-5 sm:p-6">
            <RefreshCw className="h-7 w-7 text-brand-400" strokeWidth={1.5} aria-hidden />
            <h3 className="mt-4 text-base font-semibold text-white">Оплата та повернення</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Оплата за реквізитами або карткою. Умови повернення узгоджує менеджер під час підтвердження замовлення.
            </p>
          </div>
        </section>

        {/* Tabs */}
        <section className="mt-14 lg:mt-16">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-2 w-full justify-start gap-0 sm:flex-wrap">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                Опис та огляд
              </TabsTrigger>
              <TabsTrigger value="specs" className="text-xs sm:text-sm">
                Технічні характеристики
              </TabsTrigger>
              <TabsTrigger value="compat" className="text-xs sm:text-sm">
                Сумісність
              </TabsTrigger>
              <TabsTrigger value="delivery" className="text-xs sm:text-sm">
                Доставка та самовивіз
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="rounded-2xl border border-brand-500/12 bg-surface-900/40 p-6 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start xl:gap-14">
                <div>
                  <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">Опис</h3>
                  <div className="ui-prose-pdp mt-6 max-w-none">
                    {product.description.split(/\n{2,}/).map((block, i) => (
                      <p key={i} className="mb-4 last:mb-0">
                        {block.trim()}
                      </p>
                    ))}
                  </div>
                </div>
                {soundProfile && soundProfile.length > 0 ? (
                  <SoundRadar
                    data={soundProfile}
                    title="Звуковий профіль"
                    subtitle="Суб’єктивна оцінка характеру звучання (демо)"
                    className="lg:sticky lg:top-28"
                  />
                ) : null}
              </div>
            </TabsContent>

            <TabsContent value="specs" className="rounded-2xl border border-brand-500/12 bg-surface-900/40 p-4 sm:p-6">
              {technicalRows.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-semibold text-white sm:text-xl">Параметри</h3>
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
                </div>
              ) : (
                <p className="rounded-xl border border-brand-500/10 bg-surface-900/50 p-6 text-sm text-zinc-400">
                  У базі ще немає рядків характеристик для цього товару. Заповніть блок характеристик у формі товару в
                  адмінці або виконайте{" "}
                  <code className="rounded bg-surface-800 px-1.5 py-0.5 font-mono text-xs text-brand-200">
                    npx prisma db seed
                  </code>{" "}
                  для демо-даних.
                </p>
              )}
            </TabsContent>

            <TabsContent value="compat" className="rounded-2xl border border-brand-500/12 bg-surface-900/40 p-6 sm:p-8">
              <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">Сумісність</h3>
              {compatibilityRows.length > 0 ? (
                <ul className="mt-6 space-y-4">
                  {compatibilityRows.map((row) => (
                    <li key={row.label} className="flex gap-3 border-b border-brand-500/10 pb-4 last:border-0 last:pb-0">
                      <Headphones className="mt-0.5 h-5 w-5 shrink-0 text-brand-400/80" aria-hidden />
                      <div>
                        <p className="font-medium text-white">{row.label}</p>
                        {row.detail ? (
                          <p className="mt-1 text-sm leading-relaxed text-zinc-400">{row.detail}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-sm leading-relaxed text-zinc-400">
                  Дані про сумісність не додані. Після заповнення поля <code className="rounded bg-surface-800 px-1.5 py-0.5 text-xs font-mono text-brand-200">compatibility</code> у каталозі інформація з&apos;явиться тут.
                </p>
              )}
            </TabsContent>

            <TabsContent value="delivery" className="rounded-2xl border border-brand-500/12 bg-surface-900/40 p-6 sm:p-8">
              <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">Доставка та самовивіз</h3>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                Уся логістична інформація в одному місці — без дублювання з блоками вище.
              </p>
              <ul className="mt-8 space-y-6">
                <li className="flex gap-4">
                  <Truck className="mt-1 h-6 w-6 shrink-0 text-brand-400" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-base font-semibold text-white">Кур&apos;єрські служби</h4>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      Нова Пошта та Укрпошта. Адресу вказуєте при оформленні; деталі узгоджуємо після заявки — без
                      прихованих кроків у кошику.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Package className="mt-1 h-6 w-6 shrink-0 text-brand-400" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-base font-semibold text-white">Упаковка</h4>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      Інструменти пакуємо в захисні матеріали; для гітар і клавіш — жорсткі кейси за наявності
                      комплектації.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Package className="mt-1 h-6 w-6 shrink-0 text-zinc-500" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-base font-semibold text-white">Коли відправляємо</h4>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      Термін відправки узгоджуємо після підтвердження замовлення та оплати (за домовленістю).
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <MapPin className="mt-1 h-6 w-6 shrink-0 text-brand-400" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-base font-semibold text-white">Самовивіз</h4>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      За домовленістю — у шоурумі. Години та адресу повідомляє менеджер після оформлення заявки.
                    </p>
                  </div>
                </li>
              </ul>
            </TabsContent>
          </Tabs>
        </section>

        {/* Пов\'язані товари */}
        {related.length > 0 ? (
          <section className="mt-16 border-t border-brand-500/10 pt-12 lg:mt-20 lg:pt-16">
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

        <p className="mt-12 text-center text-xs text-zinc-600">
          <Link href="/catalog" className="text-brand-400 hover:text-brand-300">
            Повернутися до каталогу
          </Link>
        </p>
      </div>
    </div>
  );
}
