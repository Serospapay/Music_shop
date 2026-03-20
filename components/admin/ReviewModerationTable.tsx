"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { moderateReviewAction } from "@/actions/adminReviewActions";

export type ReviewModerationRow = {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
  product: { name: string; slug: string };
  user: { email: string; name: string };
};

type ReviewModerationTableProps = {
  reviews: ReviewModerationRow[];
};

export function ReviewModerationTable({ reviews }: ReviewModerationTableProps) {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const runModeration = async (reviewId: string, productSlug: string, decision: "approve" | "reject") => {
    setPendingIds((prev) => new Set(prev).add(reviewId));
    try {
      const result = await moderateReviewAction(reviewId, decision, productSlug);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(decision === "approve" ? "Відгук схвалено." : "Відгук відхилено.");
      window.location.reload();
    } catch {
      toast.error("Не вдалося зберегти зміни.");
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="ui-surface-inset mt-6 p-6 text-sm text-zinc-400">
        Немає відгуків, що очікують модерації.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {reviews.map((r) => {
        const busy = pendingIds.has(r.id);
        return (
          <article
            key={r.id}
            className="rounded-2xl border border-brand-500/12 bg-surface-900/40 p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{r.product.name}</p>
                <Link
                  href={`/product/${r.product.slug}`}
                  className="text-xs text-brand-300 hover:text-brand-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Відкрити товар
                </Link>
              </div>
              <p className="text-xs text-zinc-500">
                {new Date(r.createdAt).toLocaleString("uk-UA", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <p className="mt-3 text-sm text-zinc-400">
              {r.user.name} · {r.user.email}
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Оцінка: <span className="text-brand-200">{r.rating} / 5</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{r.text}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => runModeration(r.id, r.product.slug, "approve")}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-50"
              >
                <Check className="h-4 w-4" strokeWidth={2} />
                Схвалити
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => runModeration(r.id, r.product.slug, "reject")}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-50"
              >
                <X className="h-4 w-4" strokeWidth={2} />
                Відхилити
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
