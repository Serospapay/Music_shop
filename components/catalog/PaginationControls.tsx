"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
};

export function PaginationControls({ currentPage, totalPages }: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) {
    return null;
  }

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));

    startTransition(() => {
      const nextQuery = params.toString();
      router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    });
  };

  const pagesToRender = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
  });

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={isPending || currentPage <= 1}
        className="ui-btn-outline-compact disabled:cursor-not-allowed disabled:opacity-50"
      >
        Назад
      </button>

      {pagesToRender.map((page, index) => {
        const previousPage = pagesToRender[index - 1];
        const showDots = previousPage && page - previousPage > 1;
        return (
          <div key={page} className="flex items-center gap-2">
            {showDots ? <span className="px-1 text-zinc-500">...</span> : null}
            <button
              type="button"
              onClick={() => goToPage(page)}
              disabled={isPending}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                page === currentPage
                  ? "bg-brand-500 text-surface-950 shadow-brand-sm"
                  : "border border-brand-500/25 text-brand-100 hover:border-brand-400/45 hover:bg-brand-500/10"
              }`}
            >
              {page}
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={isPending || currentPage >= totalPages}
        className="ui-btn-outline-compact disabled:cursor-not-allowed disabled:opacity-50"
      >
        Далі
      </button>
    </div>
  );
}
