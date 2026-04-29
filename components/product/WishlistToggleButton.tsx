"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toggleWishlistAction } from "@/actions/wishlistActions";
import { showErrorToast, showSuccessToast } from "@/lib/feedback-toast";

type WishlistToggleButtonProps = {
  productId: string;
  initialInWishlist: boolean;
  className?: string;
};

export function WishlistToggleButton({
  productId,
  initialInWishlist,
  className,
}: WishlistToggleButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [inWishlist, setInWishlist] = useState(initialInWishlist);

  const onToggle = () => {
    const previous = inWishlist;
    setInWishlist(!previous);
    startTransition(async () => {
      const result = await toggleWishlistAction(productId);
      if (!result.success) {
        setInWishlist(previous);
        showErrorToast({
          title: "Не вдалося оновити список бажань",
          description: result.message,
        });
        return;
      }
      setInWishlist(result.inWishlist);
      showSuccessToast({
        title: result.inWishlist ? "Товар додано у бажане" : "Товар прибрано з бажаного",
        description: "Список бажань оновлено.",
      });
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isPending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
        inWishlist
          ? "border-rose-500/45 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
          : "border-brand-500/25 bg-surface-900/45 text-zinc-200 hover:border-brand-400/45 hover:bg-brand-500/10",
        "transform-gpu duration-200",
        isPending && "animate-pulse",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      aria-label={inWishlist ? "Прибрати зі списку бажань" : "Додати у список бажань"}
    >
      <Heart className={cn("h-4 w-4", inWishlist && "fill-rose-300 text-rose-300")} strokeWidth={1.8} />
      {inWishlist ? "У бажаному" : "Додати у бажане"}
    </button>
  );
}
