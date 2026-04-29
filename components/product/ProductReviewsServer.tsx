import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { ProductReviewsClient } from "@/components/product/ProductReviewsClient";

type ProductReviewsServerProps = {
  productId: string;
  productSlug: string;
};

export async function ProductReviewsServer({ productId, productSlug }: ProductReviewsServerProps) {
  const user = await getCurrentUser();

  const approved = await prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const reviewerIds = Array.from(new Set(approved.map((r) => r.user.id)));
  const reviewerEmails = Array.from(new Set(approved.map((r) => r.user.email.toLowerCase())));
  const purchaseRows =
    reviewerIds.length > 0
      ? await prisma.order.findMany({
          where: {
            items: { some: { productId } },
            OR: [{ userId: { in: reviewerIds } }, { email: { in: reviewerEmails } }],
          },
          select: { userId: true, email: true },
        })
      : [];
  const purchasedUserIds = new Set(
    purchaseRows.map((row) => row.userId).filter((id): id is string => Boolean(id)),
  );
  const purchasedEmails = new Set(
    purchaseRows
      .map((row) => row.email?.toLowerCase().trim())
      .filter((email): email is string => Boolean(email)),
  );
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: approved.filter((review) => review.rating === stars).length,
  }));
  const ratingSum = approved.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = approved.length > 0 ? Math.round((ratingSum / approved.length) * 10) / 10 : 0;

  const mine = user
    ? await prisma.review.findUnique({
        where: {
          productId_userId: {
            productId,
            userId: user.id,
          },
        },
      })
    : null;

  const initialApproved = approved.map((r) => ({
    id: r.id,
    rating: r.rating,
    text: r.text,
    createdAt: r.createdAt.toISOString(),
    authorName: (r.user.name.split(/\s+/)[0] || r.user.name || "Покупець").trim(),
    verifiedPurchase: purchasedUserIds.has(r.user.id) || purchasedEmails.has(r.user.email.toLowerCase()),
  }));

  return (
    <ProductReviewsClient
      productId={productId}
      productSlug={productSlug}
      currentUser={user}
      initialApproved={initialApproved}
      myReview={
        mine
          ? {
              id: mine.id,
              rating: mine.rating,
              text: mine.text,
              status: mine.status,
            }
          : null
      }
      stats={{
        averageRating,
        totalApproved: approved.length,
        distribution: ratingDistribution,
      }}
    />
  );
}
