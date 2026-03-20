"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-session";
import { isValidAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { adminProductSchema } from "@/lib/validators/adminProduct";
import { specsRowsToTechnical } from "@/lib/product-json";
import { highlightsFromText, parseSpecsLines } from "@/lib/product-specs";
import { logAuditEvent } from "@/lib/audit-log";

type ActionResult = {
  success: boolean;
  message: string;
};

function parseImageUrlsBlock(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^https?:\/\/.+/i.test(l) || l.startsWith("/uploads/"))
    .slice(0, 12);
}

function buildSkuFromSlug(slug: string): string {
  const compact = slug.replace(/[^a-z0-9]+/gi, "").toUpperCase();
  const base = `OCT-${compact.slice(0, 32)}`;
  return base.length > 4 ? base : `OCT-${Date.now().toString(36).toUpperCase()}`;
}

export async function createProductAction(payload: unknown): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const isAdmin = await isValidAdminSession(adminToken);
    if (!isAdmin) {
      await logAuditEvent({
        action: "admin.product.create.denied",
        actor: "unknown",
        severity: "warn",
      });
      return { success: false, message: "Немає доступу до виконання цієї дії." };
    }

    const parsed = adminProductSchema.safeParse(payload);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Некоректні дані форми";
      await logAuditEvent({
        action: "admin.product.create.validation_failed",
        actor: "admin",
        severity: "warn",
        details: { message },
      });
      return { success: false, message };
    }

    const imageUrl = parsed.data.imageUrl.trim();
    const isValidImageUrl =
      imageUrl.startsWith("/uploads/") || /^https?:\/\/.+/i.test(imageUrl);
    if (!isValidImageUrl) {
      await logAuditEvent({
        action: "admin.product.create.invalid_image",
        actor: "admin",
        severity: "warn",
      });
      return {
        success: false,
        message: "Вкажіть коректний URL зображення або завантажте файл.",
      };
    }

    const brand = parsed.data.brand?.trim() ?? "";
    const highlights = highlightsFromText(parsed.data.highlightsText ?? "");
    const specsRows = parseSpecsLines(parsed.data.specsText ?? "");
    const extraImages = parseImageUrlsBlock(parsed.data.imageUrlsText);
    const skuInput = parsed.data.sku?.trim();
    let sku = skuInput && skuInput.length > 0 ? skuInput : buildSkuFromSlug(parsed.data.slug);

    const skuTaken = await prisma.product.findFirst({
      where: { sku },
      select: { id: true },
    });
    if (skuTaken) {
      sku = `${sku}-${Date.now().toString(36).toUpperCase()}`;
    }

    await prisma.product.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        price: parsed.data.price,
        category: parsed.data.category,
        brand,
        sku,
        highlights,
        specs: specsRows.length > 0 ? specsRows : undefined,
        technicalSpecs: specsRows.length > 0 ? specsRowsToTechnical(specsRows) : [],
        warrantyMonths: parsed.data.warrantyMonths,
        imageUrl,
        imageUrls: extraImages,
        inStock: parsed.data.inStock,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    revalidatePath(`/product/${parsed.data.slug}`);

    await logAuditEvent({
      action: "admin.product.create.success",
      actor: "admin",
      details: {
        slug: parsed.data.slug,
        category: parsed.data.category,
      },
    });

    return { success: true, message: "Товар успішно додано." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      await logAuditEvent({
        action: "admin.product.create.duplicate_slug",
        actor: "admin",
        severity: "warn",
      });
      return { success: false, message: "Товар з таким slug вже існує." };
    }

    await logAuditEvent({
      action: "admin.product.create.failed",
      actor: "admin",
      severity: "error",
      details: { error: error instanceof Error ? error.message : "UNKNOWN_ERROR" },
    });

    return { success: false, message: "Не вдалося додати товар. Спробуйте ще раз." };
  }
}
