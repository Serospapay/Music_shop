"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SortSelectProps = {
  value: "price-asc" | "price-desc";
};

export function SortSelect({ value }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const onChange = (nextSort: "price-asc" | "price-desc") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", nextSort);
    params.set("page", "1");

    startTransition(() => {
      const nextQuery = params.toString();
      router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    });
  };

  return (
    <label className="inline-flex items-center gap-2 text-sm text-zinc-400">
      <span className="whitespace-nowrap">Сортування:</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as "price-asc" | "price-desc")}
        disabled={isPending}
        className="ui-input w-auto min-w-[11rem] py-2"
      >
        <option value="price-asc">Спочатку дешевші</option>
        <option value="price-desc">Спочатку дорожчі</option>
      </select>
    </label>
  );
}
