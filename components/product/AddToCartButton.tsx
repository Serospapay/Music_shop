"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";

type AddToCartButtonProps = {
  item: {
    productId: string;
    name: string;
    slug: string;
    imageUrl: string;
    price: number;
  };
  disabled?: boolean;
  /** Вузька кнопка для мобільного sticky-бару */
  variant?: "default" | "compact";
};

export function AddToCartButton({ item, disabled = false, variant = "default" }: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (disabled) {
      return;
    }

    addItem(item);
    setIsAdded(true);
  };

  const compact =
    variant === "compact"
      ? "w-full rounded-lg bg-brand-500 px-3 py-2.5 text-center text-xs font-semibold leading-tight text-surface-950 shadow-brand-sm transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-surface-700 disabled:text-zinc-400 disabled:shadow-none"
      : "";

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
        : "Додати в кошик";

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled}
      className={variant === "compact" ? compact : "ui-btn-primary-lg"}
    >
      {label}
    </button>
  );
}
