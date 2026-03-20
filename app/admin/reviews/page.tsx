import { prisma } from "@/lib/prisma";
import { ReviewModerationTable } from "@/components/admin/ReviewModerationTable";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      product: { select: { name: true, slug: true } },
      user: { select: { email: true, name: true } },
    },
  });

  const rows = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    text: r.text,
    createdAt: r.createdAt.toISOString(),
    product: r.product,
    user: r.user,
  }));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-white">Модерація відгуків</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Схвалені відгуки з&apos;являються на сторінці товару. Відхилені можна надіслати повторно після
        редагування.
      </p>
      <ReviewModerationTable reviews={rows} />
    </div>
  );
}
