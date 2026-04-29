"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-session";
import { isValidAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";

export type OrderActionResult = { success: true } | { success: false; message: string };

const allowedStatuses: ReadonlyArray<OrderStatus> = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export async function updateOrderStatusAction(
  orderId: string,
  status: string,
): Promise<OrderActionResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!(await isValidAdminSession(token))) {
    await logAuditEvent({
      action: "admin.order.update_status.denied",
      actor: "unknown",
      severity: "warn",
      details: { orderId, status },
    });
    return { success: false, message: "Немає доступу." };
  }

  if (!allowedStatuses.includes(status as OrderStatus)) {
    return { success: false, message: "Некоректний статус замовлення." };
  }

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true },
  });
  if (!existing) {
    return { success: false, message: "Замовлення не знайдено." };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });

  await logAuditEvent({
    action: "admin.order.update_status.success",
    actor: "admin",
    details: { orderId, status },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/account");
  return { success: true };
}
