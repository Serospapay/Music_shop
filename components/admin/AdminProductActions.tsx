"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteProductAction,
  toggleProductAvailabilityAction,
  updateProductPriceAction,
  updateProductStockCountAction,
} from "@/actions/adminProducts";

type AdminProductActionsProps = {
  productId: string;
  productName: string;
  inStock: boolean;
  price: number;
  stockCount: number;
};

export function AdminProductActions({
  productId,
  productName,
  inStock,
  price,
  stockCount,
}: AdminProductActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [priceValue, setPriceValue] = useState(String(Math.round(price)));
  const [stockValue, setStockValue] = useState(String(Math.max(0, Math.floor(stockCount))));

  const onToggleStock = () => {
    startTransition(async () => {
      const result = await toggleProductAvailabilityAction(productId, !inStock);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(inStock ? "Товар знято з наявності." : "Товар повернуто в наявність.");
      router.refresh();
    });
  };

  const onUpdatePrice = () => {
    startTransition(async () => {
      const result = await updateProductPriceAction(productId, priceValue);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Ціну оновлено.");
      router.refresh();
    });
  };

  const onUpdateStock = () => {
    startTransition(async () => {
      const result = await updateProductStockCountAction(productId, stockValue);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Залишок оновлено.");
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!window.confirm(`Видалити товар "${productName}"?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteProductAction(productId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Товар видалено.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggleStock}
        disabled={isPending}
        className="ui-btn-outline-compact w-full justify-center disabled:opacity-60"
      >
        {inStock ? "Зняти з наявності" : "Повернути в наявність"}
      </button>

      <div className="flex items-center gap-2">
        <input
          type="number"
          aria-label="Нова ціна товару"
          min={1}
          step={1}
          value={priceValue}
          onChange={(event) => setPriceValue(event.target.value)}
          disabled={isPending}
          className="ui-input h-9 w-[110px] py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={onUpdatePrice}
          disabled={isPending}
          className="ui-btn-outline-compact h-9 px-2.5 text-xs disabled:opacity-60"
        >
          Ціна
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          aria-label="Новий залишок товару"
          min={0}
          step={1}
          value={stockValue}
          onChange={(event) => setStockValue(event.target.value)}
          disabled={isPending}
          className="ui-input h-9 w-[110px] py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={onUpdateStock}
          disabled={isPending}
          className="ui-btn-outline-compact h-9 px-2.5 text-xs disabled:opacity-60"
        >
          Залишок
        </button>
      </div>

      <button
        type="button"
        onClick={onDelete}
        disabled={isPending}
        className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-60"
      >
        Видалити
      </button>
    </div>
  );
}
