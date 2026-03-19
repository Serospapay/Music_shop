"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type CatalogFiltersProps = {
  categories: string[];
  selectedCategory?: string;
  minPrice?: string;
  maxPrice?: string;
};

export function CatalogFilters({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [minPriceValue, setMinPriceValue] = useState(minPrice ?? "");
  const [maxPriceValue, setMaxPriceValue] = useState(maxPrice ?? "");

  useEffect(() => {
    setMinPriceValue(minPrice ?? "");
    setMaxPriceValue(maxPrice ?? "");
  }, [minPrice, maxPrice]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(selectedCategory || minPriceValue || maxPriceValue);
  }, [selectedCategory, minPriceValue, maxPriceValue]);

  const pushParams = (params: URLSearchParams) => {
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  };

  const updateCategory = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCategory === category) {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    params.set("page", "1");
    pushParams(params);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.set("page", "1");
    pushParams(params);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    const parsedMin = minPriceValue.trim() ? Number(minPriceValue.trim()) : undefined;
    const parsedMax = maxPriceValue.trim() ? Number(maxPriceValue.trim()) : undefined;

    if (parsedMin !== undefined && Number.isFinite(parsedMin) && parsedMin >= 0) {
      params.set("minPrice", String(parsedMin));
    } else {
      params.delete("minPrice");
    }

    if (parsedMax !== undefined && Number.isFinite(parsedMax) && parsedMax >= 0) {
      params.set("maxPrice", String(parsedMax));
    } else {
      params.delete("maxPrice");
    }
    params.set("page", "1");

    pushParams(params);
  };

  return (
    <aside className="ui-surface p-5 lg:sticky lg:top-24 lg:self-start">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Фільтри</h2>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            disabled={isPending}
            className="text-xs font-medium uppercase tracking-[0.15em] text-brand-400/90 transition-all hover:text-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Скинути
          </button>
        ) : null}
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.15em] text-zinc-500">Категорія</p>
          <div className="space-y-2">
            {categories.map((category) => {
              const isChecked = selectedCategory === category;
              return (
                <label
                  key={category}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-brand-500/15 px-3 py-2 transition-all hover:border-brand-400/35"
                >
                  <span className="text-sm text-zinc-200">{category}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => updateCategory(category)}
                    disabled={isPending}
                    className="h-4 w-4 accent-brand-500"
                  />
                </label>
              );
            })}
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Ціна</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs text-zinc-400">Від</span>
              <input
                type="number"
                min={0}
                step="1"
                value={minPriceValue}
                onChange={(event) => setMinPriceValue(event.target.value)}
                disabled={isPending}
                className="ui-input py-2"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs text-zinc-400">До</span>
              <input
                type="number"
                min={0}
                step="1"
                value={maxPriceValue}
                onChange={(event) => setMaxPriceValue(event.target.value)}
                disabled={isPending}
                className="ui-input py-2"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="ui-btn-primary-block hover:scale-[1.01] disabled:hover:scale-100"
          >
            Застосувати
          </button>
        </form>
      </div>
    </aside>
  );
}
