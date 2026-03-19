"use client";

import { FormEvent, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SearchBarProps = {
  initialQuery?: string;
};

export function SearchBar({ initialQuery }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery ?? "");

  const applyQuery = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();

    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    params.set("page", "1");

    startTransition(() => {
      const nextQuery = params.toString();
      router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyQuery(query);
  };

  const onReset = () => {
    setQuery("");
    applyQuery("");
  };

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Пошук за назвою інструменту..."
        disabled={isPending}
        className="ui-input px-4"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="ui-btn-primary-compact hover:scale-[1.02] disabled:hover:scale-100"
        >
          Знайти
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={isPending}
          className="ui-btn-outline"
        >
          Скинути
        </button>
      </div>
    </form>
  );
}
