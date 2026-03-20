"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPriceUah } from "@/lib/format";
import { cn } from "@/lib/utils";

export type CartSheetProps = {
  triggerClassName?: string;
  badgeClassName?: string;
};

export function CartSheet({ triggerClassName, badgeClassName }: CartSheetProps = {}) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const totalQuantity = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  );
  const totalAmount = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items],
  );

  const portalLayer = mounted ? (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="cart-scrim"
            className="ui-overlay-scrim fixed inset-0 z-[120]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
          <motion.aside
            key="cart-panel"
            className={cn(
              "fixed inset-y-0 right-0 z-[130] flex w-full max-w-md flex-col",
              "border-l border-brand-500/15 bg-surface-950 shadow-2xl",
              "h-[100dvh] max-h-[100dvh] min-h-0",
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-sheet-title"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-brand-500/10 px-5 py-4">
              <div>
                <p id="cart-sheet-title" className="text-lg font-semibold tracking-tight text-white">
                  Кошик
                </p>
                <p className="text-sm text-zinc-400">
                  {totalQuantity}{" "}
                  {totalQuantity === 1 ? "позиція" : totalQuantity < 5 ? "позиції" : "позицій"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="ui-icon-btn"
                aria-label="Закрити кошик"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <p className="text-lg font-medium text-zinc-200">Кошик порожній</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Додайте інструмент із каталогу, щоб продовжити оформлення.
                </p>
                <Link
                  href="/catalog"
                  onClick={() => setIsOpen(false)}
                  className="ui-btn-primary-compact mt-6"
                >
                  Перейти в каталог
                </Link>
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-4">
                  <ul className="flex flex-col gap-4">
                    {items.map((item) => {
                      const lineTotal = item.price * item.quantity;
                      return (
                        <li key={item.productId}>
                          <article className="overflow-hidden rounded-2xl border border-brand-500/12 bg-surface-900/90 shadow-sm">
                            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-5">
                              <Link
                                href={`/product/${item.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="relative aspect-square w-full max-w-[6.5rem] shrink-0 overflow-hidden rounded-xl border border-brand-500/10 bg-surface-850 sm:max-w-none"
                              >
                                <Image
                                  src={item.imageUrl}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 640px) 88px, 104px"
                                />
                              </Link>
                              <div className="flex min-w-0 flex-col justify-between gap-3">
                                <div className="min-w-0">
                                  <Link
                                    href={`/product/${item.slug}`}
                                    onClick={() => setIsOpen(false)}
                                    className="line-clamp-3 text-left text-sm font-semibold leading-snug text-white transition-colors hover:text-brand-200 sm:text-base"
                                    title={item.name}
                                  >
                                    {item.name}
                                  </Link>
                                  <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs sm:text-sm">
                                    <span className="text-zinc-500">{formatPriceUah(item.price)}</span>
                                    <span className="text-zinc-600">×</span>
                                    <span className="tabular-nums text-zinc-400">{item.quantity} шт.</span>
                                  </div>
                                  <p className="mt-1 text-base font-semibold tabular-nums text-brand-100 sm:text-lg">
                                    {formatPriceUah(lineTotal)}
                                  </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div className="inline-flex items-center rounded-lg border border-brand-500/20 bg-surface-950/80 p-0.5">
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                      className="ui-stepper-btn"
                                      aria-label="Зменшити кількість"
                                    >
                                      <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                                    </button>
                                    <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums text-white">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                      className="ui-stepper-btn"
                                      aria-label="Збільшити кількість"
                                    >
                                      <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeItem(item.productId)}
                                    className={cn(
                                      "inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-500/25 px-2.5 py-1.5 text-xs font-medium text-rose-300 transition",
                                      "hover:border-rose-400/50 hover:bg-rose-500/10 hover:text-rose-200",
                                    )}
                                    aria-label="Видалити товар з кошика"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                                    Видалити
                                  </button>
                                </div>
                              </div>
                            </div>
                          </article>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="shrink-0 border-t border-brand-500/10 bg-surface-950/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Разом</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {totalQuantity} {totalQuantity === 1 ? "товар" : "товарів"} у кошику
                      </p>
                    </div>
                    <p className="text-xl font-bold tabular-nums tracking-tight text-white sm:text-2xl">
                      {formatPriceUah(totalAmount)}
                    </p>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="ui-btn-primary-block"
                  >
                    Перейти до оформлення
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  ) : null;

  return (
    <>
      <button
        type="button"
        aria-label="Відкрити кошик"
        aria-expanded={isOpen ? true : false}
        onClick={() => setIsOpen(true)}
        className={cn(
          "relative rounded-full border border-brand-500/25 p-2.5 text-zinc-200 shadow-lg transition-all duration-300 hover:scale-105 hover:border-brand-400/45 hover:text-brand-100",
          triggerClassName,
        )}
      >
        <ShoppingCart className="h-5 w-5" strokeWidth={2} />
        {totalQuantity > 0 ? (
          <span
            className={cn(
              "absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-xs font-bold text-surface-950",
              badgeClassName,
            )}
          >
            {totalQuantity > 99 ? "99+" : totalQuantity}
          </span>
        ) : null}
      </button>

      {mounted ? createPortal(portalLayer, document.body) : null}
    </>
  );
}
