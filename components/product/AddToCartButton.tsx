"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
  item: {
    productId: string;
    name: string;
    slug: string;
    imageUrl: string;
    price: number;
  };
  quantity: number;
  disabled?: boolean;
  /** Вузька кнопка для мобільного sticky-бару */
  variant?: "default" | "compact" | "premium";
  className?: string;
};

export function AddToCartButton({
  item,
  quantity,
  disabled = false,
  variant = "default",
  className,
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (disabled) {
      return;
    }

    const qty = Math.max(1, Math.min(99, Math.floor(quantity)));
    addItem({ ...item, quantity: qty });
    setIsAdded(true);
    toast.success(`Додано в кошик: ${qty} шт. — ${item.name}`);
  };

  const compact =
    "w-full rounded-lg bg-brand-500 px-3 py-2.5 text-center text-xs font-semibold leading-tight text-surface-950 shadow-brand-sm transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-surface-700 disabled:text-zinc-400 disabled:shadow-none";

  const premium =
    "w-full rounded-2xl bg-brand-500 py-4 text-sm font-bold uppercase tracking-[0.14em] text-surface-950 shadow-brand transition hover:bg-brand-400 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-brand-500 disabled:active:scale-100";

  const label = disabled
    ? variant === "compact"
      ? "Недоступно"
      : "Тимчасово недоступно"
    : isAdded
      ? variant === "compact"
        ? "У кошику"
        : "Додано в кошик"
      : variant === "compact"
        ? "У кошик"
        : variant === "premium"
          ? "Додати в кошик"
          : "Додати в кошик";

  const variantClass =
    variant === "compact" ? compact : variant === "premium" ? premium : "ui-btn-primary-lg";

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled}
      className={cn(variantClass, variant === "premium" && !disabled && "hover:shadow-brand-sm", className)}
    >
      {label}
    </button>
  );
}
