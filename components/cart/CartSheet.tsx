"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPriceUah } from "@/lib/format";

export function CartSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const totalQuantity = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  );
  const totalAmount = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items],
  );

  return (
    <>
      <button
        type="button"
        aria-label="Відкрити кошик"
        onClick={() => setIsOpen(true)}
        className="relative rounded-full border border-brand-500/25 p-2.5 text-zinc-200 shadow-lg transition-all duration-300 hover:scale-105 hover:border-brand-400/45 hover:text-brand-100"
      >
        <ShoppingCart className="h-5 w-5" />
        {totalQuantity > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-xs font-semibold text-white">
            {totalQuantity > 99 ? "99+" : totalQuantity}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div
              className="ui-overlay-scrim fixed inset-0 z-[80]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 z-[85] flex h-full w-full max-w-md flex-col border-l border-brand-500/15 bg-surface-950 shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between border-b border-brand-500/10 px-5 py-4">
                <div>
                  <p className="text-lg font-semibold text-white">Кошик</p>
                  <p className="text-sm text-zinc-400">{totalQuantity} товар(ів)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="ui-icon-btn"
                  aria-label="Закрити кошик"
                >
                  <X className="h-4 w-4" />
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
                  <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                    {items.map((item) => (
                      <article
                        key={item.productId}
                        className="rounded-2xl border border-brand-500/15 bg-surface-850/80 p-3 shadow-lg backdrop-blur-sm"
                      >
                        <div className="flex gap-3">
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-brand-500/10">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/product/${item.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="line-clamp-2 text-sm font-semibold text-white transition-colors hover:text-brand-200"
                            >
                              {item.name}
                            </Link>
                            <p className="mt-1 text-sm text-brand-200/90">{formatPriceUah(item.price)}</p>

                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  className="ui-stepper-btn"
                                  aria-label="Зменшити кількість"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-6 text-center text-sm text-zinc-200">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  className="ui-stepper-btn"
                                  aria-label="Збільшити кількість"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(item.productId)}
                                className="rounded-lg border border-rose-500/30 p-1.5 text-rose-300 transition-all hover:border-rose-400/50 hover:text-rose-200"
                                aria-label="Видалити товар"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="border-t border-brand-500/10 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-zinc-400">Загальна сума</p>
                      <p className="text-xl font-semibold text-white">{formatPriceUah(totalAmount)}</p>
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
    </>
  );
}
