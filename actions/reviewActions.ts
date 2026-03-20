"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { reviewSubmitSchema } from "@/lib/validators/review";

export type ReviewActionResult = { success: true } | { success: false; message: string };

export async function submitReviewAction(payload: unknown): Promise<ReviewActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Увійдіть, щоб залишити відгук." };
  }

  const parsed = reviewSubmitSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Некоректні дані" };
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true, slug: true },
  });
  if (!product) {
    return { success: false, message: "Товар не знайдено." };
  }

  await prisma.review.upsert({
    where: {
      productId_userId: {
        productId: parsed.data.productId,
        userId: user.id,
      },
    },
    create: {
      productId: parsed.data.productId,
      userId: user.id,
      rating: parsed.data.rating,
      text: parsed.data.text,
      status: "PENDING",
    },
    update: {
      rating: parsed.data.rating,
      text: parsed.data.text,
      status: "PENDING",
    },
  });

  revalidatePath(`/product/${product.slug}`);
  return { success: true };
}
