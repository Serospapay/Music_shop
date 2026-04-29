"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPriceUah } from "@/lib/format";
import { removeWishlistItemAction } from "@/actions/wishlistActions";
import { showErrorToast, showSuccessToast } from "@/lib/feedback-toast";

type WishlistRow = {
  productId: string;
  productName: string;
  slug: string;
  imageUrl: string;
  category: string;
  price: number;
  inStock: boolean;
  addedAt: string;
};

type WishlistSectionProps = {
  initialItems: WishlistRow[];
};

export function WishlistSection({ initialItems }: WishlistSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const onRemove = (productId: string) => {
    setRemovingId(productId);
    startTransition(async () => {
      const result = await removeWishlistItemAction(productId);
      if (!result.success) {
        showErrorToast({
          title: "Не вдалося оновити список бажань",
          description: result.message,
        });
        setRemovingId(null);
        return;
      }
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      showSuccessToast({
        title: "Товар прибрано з бажаного",
        description: "Зміни збережено.",
      });
      setRemovingId(null);
      router.refresh();
    });
  };

  if (items.length === 0) {
    return (
      <p className="mt-8 text-sm text-zinc-400">
        Список бажань порожній.{" "}
        <Link href="/catalog" className="font-medium text-brand-300 hover:text-brand-200">
          Перейти в каталог
        </Link>
      </p>
    );
  }

  return (
    <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((item) => (
        <li key={item.productId} className="rounded-2xl border border-brand-500/10 bg-surface-900/50 p-4">
          <div className="flex gap-3">
            <Link
              href={`/product/${item.slug}`}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-brand-500/10"
            >
              <Image src={item.imageUrl} alt={item.productName} fill unoptimized className="object-cover" sizes="80px" />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">{item.category}</p>
              <Link href={`/product/${item.slug}`} className="mt-1 line-clamp-2 text-sm font-semibold text-white hover:text-brand-200">
                {item.productName}
              </Link>
              <p className="mt-1 text-sm font-semibold text-brand-200">{formatPriceUah(item.price)}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {item.inStock ? "В наявності" : "Немає в наявності"} · додано{" "}
                {new Date(item.addedAt).toLocaleDateString("uk-UA")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            disabled={isPending && removingId === item.productId}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition duration-200 hover:bg-rose-500/20 disabled:opacity-60"
          >
            <HeartOff className="h-3.5 w-3.5" />
            Прибрати
          </button>
        </li>
      ))}
    </ul>
  );
}
