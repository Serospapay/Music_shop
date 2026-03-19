"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Link2, ListMusic } from "lucide-react";

type ProductShareAndCatalogProps = {
  category: string;
  absoluteProductUrl: string;
};

export function ProductShareAndCatalog({ category, absoluteProductUrl }: ProductShareAndCatalogProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(absoluteProductUrl);
      setCopied(true);
      toast.success("Посилання скопійовано");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Не вдалося скопіювати посилання");
    }
  }, [absoluteProductUrl]);

  const catalogHref = `/catalog?category=${encodeURIComponent(category)}`;

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-xl border border-brand-500/20 bg-surface-950/50 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-brand-100"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} />
        ) : (
          <Link2 className="h-4 w-4" strokeWidth={2} />
        )}
        {copied ? "Скопійовано" : "Копіювати посилання"}
      </button>
      <Link
        href={catalogHref}
        className="inline-flex items-center gap-2 rounded-xl border border-brand-500/20 bg-surface-950/50 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-brand-100"
      >
        <ListMusic className="h-4 w-4" strokeWidth={2} />
        Інше в «{category}»
      </Link>
    </div>
  );
}
