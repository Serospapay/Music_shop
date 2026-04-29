"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type CatalogFiltersProps = {
  categories: string[];
  brands: string[];
  selectedCategory?: string;
  selectedBrand?: string;
  inStockOnly: boolean;
  minPrice?: string;
  maxPrice?: string;
  priceBounds: {
    min: number;
    max: number;
  };
};

export function CatalogFilters({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  inStockOnly,
  minPrice,
  maxPrice,
  priceBounds,
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

  const formatNumber = (value: number) => new Intl.NumberFormat("uk-UA").format(value);
  const parsePriceInput = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return undefined;
    }
    return Math.floor(parsed);
  };

  const quickRanges = useMemo(() => {
    if (priceBounds.max <= 0) {
      return [];
    }
    const lowMax = Math.max(priceBounds.min, Math.floor(priceBounds.max * 0.33));
    const midMin = lowMax + 1;
    const midMax = Math.max(midMin, Math.floor(priceBounds.max * 0.66));
    const highMin = Math.max(midMax + 1, priceBounds.min);
    return [
      {
        label: `До ${formatNumber(lowMax)} грн`,
        min: "",
        max: String(lowMax),
      },
      {
        label: `${formatNumber(midMin)} – ${formatNumber(midMax)} грн`,
        min: String(midMin),
        max: String(midMax),
      },
      {
        label: `Від ${formatNumber(highMin)} грн`,
        min: String(highMin),
        max: "",
      },
    ];
  }, [priceBounds.max, priceBounds.min]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(selectedCategory || selectedBrand || inStockOnly || minPrice || maxPrice);
  }, [inStockOnly, maxPrice, minPrice, selectedBrand, selectedCategory]);

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

  const updateBrand = (brand: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedBrand === brand) {
      params.delete("brand");
    } else {
      params.set("brand", brand);
    }
    params.set("page", "1");
    pushParams(params);
  };

  const toggleInStock = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (inStockOnly) {
      params.delete("inStock");
    } else {
      params.set("inStock", "1");
    }
    params.set("page", "1");
    pushParams(params);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("brand");
    params.delete("inStock");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.set("page", "1");
    setMinPriceValue("");
    setMaxPriceValue("");
    pushParams(params);
  };

  const applyPrice = (min: string, max: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const parsedMin = parsePriceInput(min);
    const parsedMax = parsePriceInput(max);
    const normalizedMin =
      parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax ? parsedMax : parsedMin;
    const normalizedMax =
      parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax ? parsedMin : parsedMax;

    if (normalizedMin !== undefined) {
      params.set("minPrice", String(normalizedMin));
    } else {
      params.delete("minPrice");
    }

    if (normalizedMax !== undefined) {
      params.set("maxPrice", String(normalizedMax));
    } else {
      params.delete("maxPrice");
    }

    params.set("page", "1");
    pushParams(params);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyPrice(minPriceValue, maxPriceValue);
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

        {brands.length > 0 ? (
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.15em] text-zinc-500">Бренд</p>
            <div className="space-y-2">
              {brands.map((brand) => {
                const isChecked = selectedBrand === brand;
                return (
                  <label
                    key={brand}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-brand-500/15 px-3 py-2 transition-all hover:border-brand-400/35"
                  >
                    <span className="text-sm text-zinc-200">{brand}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => updateBrand(brand)}
                      disabled={isPending}
                      className="h-4 w-4 accent-brand-500"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.15em] text-zinc-500">Наявність</p>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-brand-500/15 px-3 py-2 transition-all hover:border-brand-400/35">
            <span className="text-sm text-zinc-200">Лише в наявності</span>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={toggleInStock}
              disabled={isPending}
              className="h-4 w-4 accent-brand-500"
            />
          </label>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Ціна</p>
          {priceBounds.max > 0 ? (
            <p className="text-xs text-zinc-500">
              Діапазон каталогу: {formatNumber(priceBounds.min)} – {formatNumber(priceBounds.max)} грн
            </p>
          ) : null}
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
          {quickRanges.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {quickRanges.map((range) => (
                <button
                  key={range.label}
                  type="button"
                  onClick={() => {
                    setMinPriceValue(range.min);
                    setMaxPriceValue(range.max);
                    applyPrice(range.min, range.max);
                  }}
                  disabled={isPending}
                  className="rounded-lg border border-brand-500/20 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:border-brand-400/45 hover:text-zinc-100 disabled:opacity-60"
                >
                  {range.label}
                </button>
              ))}
            </div>
          ) : null}

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
