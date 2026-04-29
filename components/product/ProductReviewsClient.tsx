"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { submitReviewAction } from "@/actions/reviewActions";
import type { SessionUser } from "@/lib/user-auth";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

type PublicReview = {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
  authorName: string;
  verifiedPurchase: boolean;
};

type MyReview = {
  id: string;
  rating: number;
  text: string;
  status: ReviewStatus;
};

type ProductReviewsClientProps = {
  productId: string;
  productSlug: string;
  currentUser: SessionUser | null;
  initialApproved: PublicReview[];
  myReview: MyReview | null;
  stats: {
    averageRating: number;
    totalApproved: number;
    distribution: Array<{ stars: number; count: number }>;
  };
};

export function ProductReviewsClient({
  productId,
  productSlug,
  currentUser,
  initialApproved,
  myReview,
  stats,
}: ProductReviewsClientProps) {
  const router = useRouter();
  const [rating, setRating] = useState(myReview?.rating ?? 5);
  const [text, setText] = useState(myReview?.text ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRating(myReview?.rating ?? 5);
    setText(myReview?.text ?? "");
  }, [myReview?.id, myReview?.rating, myReview?.text]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Увійдіть, щоб залишити відгук.");
      return;
    }
    setLoading(true);
    try {
      const result = await submitReviewAction({ productId, rating, text });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(
        myReview ? "Відгук оновлено й знову надіслано на модерацію." : "Відгук надіслано на модерацію.",
      );
      router.refresh();
    } catch {
      toast.error("Не вдалося зберегти відгук.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border-t border-brand-500/10 pt-12 lg:pt-16" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="font-display text-2xl font-semibold text-white sm:text-3xl">
        Відгуки покупців
      </h2>
      <p className="mt-2 text-sm text-zinc-500">
        Публікуються після перевірки модератором. Один відгук на акаунт для цього товару.
      </p>

      {currentUser ? (
        <div className="mt-8 rounded-2xl border border-brand-500/12 bg-surface-900/50 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-white">Ваш відгук</h3>
          {myReview ? (
            <p className="mt-2 text-sm text-zinc-400">
              Статус:{" "}
              {myReview.status === "PENDING" ? (
                <span className="text-amber-200">на модерації</span>
              ) : myReview.status === "APPROVED" ? (
                <span className="text-emerald-200">схвалено</span>
              ) : (
                <span className="text-rose-200">відхилено — ви можете відредагувати та надіслати знову</span>
              )}
            </p>
          ) : null}
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Оцінка</p>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className="rounded-lg p-1 text-brand-400 transition hover:scale-110 focus-visible:outline focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:opacity-50"
                    disabled={loading}
                    aria-label={`${n} зірок`}
                  >
                    <Star
                      className={n <= rating ? "fill-brand-400 text-brand-400" : "text-zinc-600"}
                      size={28}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </div>
            <label className="block space-y-2">
              <span className="ui-label">Текст відгуку</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                minLength={10}
                maxLength={2000}
                required
                disabled={loading}
                className="ui-input min-h-[6rem] resize-y"
                placeholder="Опишіть враження від товару (мінімум 10 символів)..."
              />
            </label>
            <button
              type="submit"
              disabled={loading || text.trim().length < 10}
              className="ui-btn-primary-compact disabled:opacity-50"
            >
              {loading ? "Збереження..." : myReview ? "Оновити відгук" : "Надіслати на модерацію"}
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-brand-500/10 bg-surface-900/40 p-6 text-sm text-zinc-400">
          <Link href={`/login?next=/product/${encodeURIComponent(productSlug)}`} className="font-medium text-brand-300 hover:text-brand-200">
            Увійдіть
          </Link>
          , щоб залишити відгук, або{" "}
          <Link href="/register" className="font-medium text-brand-300 hover:text-brand-200">
            зареєструйтеся
          </Link>
          .
        </div>
      )}

      <div className="mt-10 space-y-6">
        {stats.totalApproved > 0 ? (
          <div className="rounded-2xl border border-brand-500/12 bg-surface-900/35 p-5 sm:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Середня оцінка</p>
                <p className="mt-2 flex items-end gap-2">
                  <span className="font-display text-4xl text-white">{stats.averageRating.toFixed(1)}</span>
                  <span className="pb-1 text-sm text-zinc-400">з 5</span>
                </p>
                <p className="mt-1 text-sm text-zinc-400">{stats.totalApproved} підтверджених публікацій</p>
              </div>
              <div className="w-full max-w-md space-y-2">
                {stats.distribution.map((row) => {
                  return (
                    <div key={row.stars} className="grid grid-cols-[3rem,1fr,2.5rem] items-center gap-2">
                      <span className="text-xs text-zinc-400">{row.stars}★</span>
                      <progress
                        value={row.count}
                        max={Math.max(1, stats.totalApproved)}
                        className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-surface-800 [&::-webkit-progress-value]:bg-brand-400/80 [&::-moz-progress-bar]:bg-brand-400/80"
                      />
                      <span className="text-right text-xs text-zinc-500">{row.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {initialApproved.length === 0 ? (
          <p className="text-sm text-zinc-500">Ще немає схвалених відгуків.</p>
        ) : (
          initialApproved.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-brand-500/10 bg-surface-900/30 p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white">{r.authorName}</p>
                  {r.verifiedPurchase ? (
                    <span className="rounded-full border border-emerald-500/35 bg-emerald-500/12 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                      Підтверджена покупка
                    </span>
                  ) : null}
                </div>
                <time className="text-xs text-zinc-500" dateTime={r.createdAt}>
                  {new Date(r.createdAt).toLocaleDateString("uk-UA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
              <div className="mt-2 flex gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < r.rating ? "fill-brand-400 text-brand-400" : "text-zinc-700"}
                    strokeWidth={1.25}
                  />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{r.text}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
