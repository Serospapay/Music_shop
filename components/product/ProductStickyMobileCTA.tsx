"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatPriceUah } from "@/lib/format";
import { AddToCartButton } from "@/components/product/AddToCartButton";

type CartItem = {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
};

type ProductStickyMobileCTAProps = {
  productName: string;
  price: number;
  inStock: boolean;
  cartItem: CartItem;
  quantity: number;
  /** Елемент після якого показувати бар (звичайно блок із героєм + верх інфо) */
  sentinelRef: React.RefObject<HTMLElement | null>;
};

export function ProductStickyMobileCTA({
  productName,
  price,
  inStock,
  cartItem,
  quantity,
  sentinelRef,
}: ProductStickyMobileCTAProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        setShow(!entry?.isIntersecting);
      },
      { root: null, rootMargin: "-48px 0px 0px 0px", threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [sentinelRef]);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-brand-500/15 bg-surface-950/92 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 38 }}
        >
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-zinc-500">{productName}</p>
              <p className="text-sm font-semibold text-brand-100">{formatPriceUah(price)}</p>
              {quantity > 1 ? (
                <p className="text-[11px] text-zinc-500">Кількість: {quantity}</p>
              ) : null}
            </div>
            <div className="w-[min(100%,8.5rem)] shrink-0">
              <AddToCartButton
                item={cartItem}
                quantity={quantity}
                disabled={!inStock}
                variant="compact"
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
