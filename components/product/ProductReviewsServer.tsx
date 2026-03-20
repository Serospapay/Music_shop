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
    take: 50,
    include: {
      user: { select: { name: true } },
    },
  });

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
    />
  );
}
