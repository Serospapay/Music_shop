import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminReviewStatusControl } from "@/components/admin/AdminReviewStatusControl";

export const dynamic = "force-dynamic";

type AdminReviewsPageProps = {
  searchParams?: {
    q?: string;
    status?: string;
    page?: string;
  };
};

const statusValues = ["all", "PENDING", "APPROVED", "REJECTED"] as const;
type StatusValue = (typeof statusValues)[number];

function toPage(value?: string) {
  const n = Number(value ?? "1");
  if (!Number.isFinite(n) || n <= 0) {
    return 1;
  }
  return Math.floor(n);
}

const statusUiLabel: Record<Exclude<StatusValue, "all">, string> = {
  PENDING: "Очікує",
  APPROVED: "Схвалено",
  REJECTED: "Відхилено",
};

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
  const ITEMS_PER_PAGE = 20;
  const q = searchParams?.q?.trim() ?? "";
  const status: StatusValue =
    searchParams?.status && statusValues.includes(searchParams.status as StatusValue)
      ? (searchParams.status as StatusValue)
      : "all";
  const requestedPage = toPage(searchParams?.page);

  const where: Prisma.ReviewWhereInput = {};
  if (status !== "all") {
    where.status = status;
  }
  if (q) {
    where.OR = [
      { text: { contains: q, mode: "insensitive" } },
      { product: { name: { contains: q, mode: "insensitive" } } },
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [totalReviews, pendingCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { status: "APPROVED" } }),
    prisma.review.count({ where: { status: "REJECTED" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalReviews / ITEMS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    include: {
      product: { select: { name: true, slug: true, category: true } },
      user: { select: { email: true, name: true, id: true } },
    },
  });
  const hasFilters = Boolean(q || status !== "all");
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (q) {
      params.set("q", q);
    }
    if (status !== "all") {
      params.set("status", status);
    }
    params.set("page", String(page));
    return `/admin/reviews?${params.toString()}`;
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="ui-page-eyebrow">Адмін / Відгуки</p>
        <h1 className="mt-2 font-display text-3xl font-normal text-white sm:text-4xl">Модерація відгуків</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Керуйте чергою відгуків, перевіряйте авторів і змінюйте статуси без перезавантаження сторінки.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="ui-surface-inset p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Очікує модерації</p>
          <p className="mt-2 text-2xl font-semibold text-amber-200">{pendingCount}</p>
        </div>
        <div className="ui-surface-inset p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Схвалено</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-200">{approvedCount}</p>
        </div>
        <div className="ui-surface-inset p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Відхилено</p>
          <p className="mt-2 text-2xl font-semibold text-rose-200">{rejectedCount}</p>
        </div>
      </section>

      <section className="ui-surface p-4 sm:p-5">
        <form method="get" className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr,220px,auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            className="ui-input"
            placeholder="Пошук: текст, товар, ім'я або email автора"
          />
          <select
            name="status"
            defaultValue={status}
            className="ui-input"
            aria-label="Фільтр статусу відгуків"
          >
            <option value="all">Усі статуси</option>
            <option value="PENDING">Очікує</option>
            <option value="APPROVED">Схвалено</option>
            <option value="REJECTED">Відхилено</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="ui-btn-primary-compact h-[42px] px-4">
              Застосувати
            </button>
            {hasFilters ? (
              <Link href="/admin/reviews" className="ui-btn-outline-compact h-[42px] px-4">
                Скинути
              </Link>
            ) : null}
          </div>
        </form>
        <p className="mt-3 text-sm text-zinc-400">
          Показано: <span className="font-semibold text-zinc-200">{totalReviews}</span>
          {hasFilters ? " за активними фільтрами." : " відгуків."}
        </p>
      </section>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Товар</TableHead>
            <TableHead>Автор</TableHead>
            <TableHead>Оцінка</TableHead>
            <TableHead>Текст</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell>
                <p className="font-medium text-white">{review.product.name}</p>
                <p className="text-xs text-zinc-500">{review.product.category}</p>
                <Link
                  href={`/product/${review.product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex text-xs text-brand-300 hover:text-brand-200"
                >
                  Відкрити товар
                </Link>
              </TableCell>
              <TableCell>
                <p>{review.user.name}</p>
                <p className="text-xs text-zinc-500">{review.user.email}</p>
              </TableCell>
              <TableCell>
                <span className="inline-flex rounded-full bg-brand-500/12 px-2.5 py-1 text-xs font-semibold text-brand-100">
                  {review.rating} / 5
                </span>
              </TableCell>
              <TableCell className="max-w-[360px] text-zinc-300">
                <p className="line-clamp-4">{review.text}</p>
              </TableCell>
              <TableCell>
                <p className="mb-2 text-xs text-zinc-500">{statusUiLabel[review.status]}</p>
                <AdminReviewStatusControl reviewId={review.id} status={review.status} />
              </TableCell>
              <TableCell className="text-zinc-400">
                {review.createdAt.toLocaleString("uk-UA", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </TableCell>
            </TableRow>
          ))}
          {reviews.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-zinc-400">
                За поточними параметрами відгуків не знайдено.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
          <p>
            Сторінка <span className="font-semibold text-zinc-200">{currentPage}</span> з{" "}
            <span className="font-semibold text-zinc-200">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Link
              href={pageHref(Math.max(1, currentPage - 1))}
              className={`ui-btn-outline-compact ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              Назад
            </Link>
            <Link
              href={pageHref(Math.min(totalPages, currentPage + 1))}
              className={`ui-btn-outline-compact ${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}`}
            >
              Вперед
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
