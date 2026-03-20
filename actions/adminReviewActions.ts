"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-session";
import { isValidAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";

export type ModerateResult = { success: true } | { success: false; message: string };

export async function moderateReviewAction(
  reviewId: string,
  decision: "approve" | "reject",
  productSlug: string,
): Promise<ModerateResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!(await isValidAdminSession(token))) {
    return { success: false, message: "Немає доступу." };
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true },
  });
  if (!review) {
    return { success: false, message: "Відгук не знайдено." };
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { status: decision === "approve" ? "APPROVED" : "REJECTED" },
  });

  await logAuditEvent({
    action: decision === "approve" ? "admin.review.approve" : "admin.review.reject",
    actor: "admin",
    details: { reviewId },
  });

  revalidatePath("/admin/reviews");
  revalidatePath(`/product/${productSlug}`);
  return { success: true };
}
