"use server";

import { Prisma } from "@prisma/client";
import { MongoClient, ObjectId } from "mongodb";
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

async function ensureAdminOrDeny(action: string): Promise<boolean> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const isAdmin = await isValidAdminSession(adminToken);
  if (!isAdmin) {
    await logAuditEvent({
      action,
      actor: "unknown",
      severity: "warn",
    });
  }
  return isAdmin;
}

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

function isValidImageUrl(imageUrl: string): boolean {
  return imageUrl.startsWith("/uploads/") || /^https?:\/\/.+/i.test(imageUrl);
}

function isMongoReplicaSetError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2031"
  );
}

function databaseNameFromUrl(url: string) {
  try {
    const normalized = url.replace(/^mongodb(\+srv)?:\/\//, "http://");
    const parsed = new URL(normalized);
    const path = parsed.pathname.replace(/^\//, "").split("?")[0];
    if (path) {
      return path;
    }
  } catch {
    /* ignore */
  }
  return process.env.MONGO_DB_NAME?.trim() || "octave_shop";
}

async function updateProductViaMongoDirect(
  productId: string,
  data: {
    name: string;
    slug: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    sku: string;
    highlights: string[];
    specsRows: Array<{ label: string; value: string }>;
    technicalSpecs: Array<{ key: string; value: string }>;
    warrantyMonths: number;
    imageUrl: string;
    imageUrls: string[];
    inStock: boolean;
  },
) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL_MISSING");
  }
  const client = new MongoClient(url);
  await client.connect();
  try {
    const db = client.db(databaseNameFromUrl(url));
    const productCollection = db.collection("Product");
    const result = await productCollection.updateOne(
      { _id: new ObjectId(productId) },
      {
        $set: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price,
          category: data.category,
          brand: data.brand,
          sku: data.sku,
          highlights: data.highlights,
          specs: data.specsRows,
          technicalSpecs: data.technicalSpecs,
          warrantyMonths: data.warrantyMonths,
          imageUrl: data.imageUrl,
          imageUrls: data.imageUrls,
          inStock: data.inStock,
        },
      },
    );
    if (result.matchedCount === 0) {
      throw new Error("PRODUCT_NOT_FOUND");
    }
  } finally {
    await client.close();
  }
}

export async function createProductAction(payload: unknown): Promise<ActionResult> {
  try {
    const isAdmin = await ensureAdminOrDeny("admin.product.create.denied");
    if (!isAdmin) {
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
    if (!isValidImageUrl(imageUrl)) {
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

export async function toggleProductAvailabilityAction(
  productId: string,
  nextInStock: boolean,
): Promise<ActionResult> {
  const isAdmin = await ensureAdminOrDeny("admin.product.toggle_availability.denied");
  if (!isAdmin) {
    return { success: false, message: "Немає доступу." };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  if (!product) {
    return { success: false, message: "Товар не знайдено." };
  }

  await prisma.product.update({
    where: { id: productId },
    data: { inStock: nextInStock },
  });

  await logAuditEvent({
    action: "admin.product.toggle_availability.success",
    actor: "admin",
    details: { productId, inStock: nextInStock },
  });

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  revalidatePath(`/product/${product.slug}`);
  return { success: true, message: "Статус наявності оновлено." };
}

export async function updateProductPriceAction(
  productId: string,
  rawPrice: string,
): Promise<ActionResult> {
  const isAdmin = await ensureAdminOrDeny("admin.product.update_price.denied");
  if (!isAdmin) {
    return { success: false, message: "Немає доступу." };
  }

  const price = Number(rawPrice);
  if (!Number.isFinite(price) || price <= 0) {
    return { success: false, message: "Некоректна ціна." };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  if (!product) {
    return { success: false, message: "Товар не знайдено." };
  }

  await prisma.product.update({
    where: { id: productId },
    data: { price },
  });

  await logAuditEvent({
    action: "admin.product.update_price.success",
    actor: "admin",
    details: { productId, price },
  });

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  revalidatePath(`/product/${product.slug}`);
  return { success: true, message: "Ціну оновлено." };
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  const isAdmin = await ensureAdminOrDeny("admin.product.delete.denied");
  if (!isAdmin) {
    return { success: false, message: "Немає доступу." };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true, name: true },
  });
  if (!product) {
    return { success: false, message: "Товар не знайдено." };
  }

  const linkedOrderItems = await prisma.orderItem.count({
    where: { productId },
  });
  if (linkedOrderItems > 0) {
    return {
      success: false,
      message:
        "Цей товар вже присутній у замовленнях. Видалення заборонено, щоб не зламати історію продажів.",
    };
  }

  await prisma.product.delete({ where: { id: productId } });

  await logAuditEvent({
    action: "admin.product.delete.success",
    actor: "admin",
    details: { productId, name: product.name },
  });

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  revalidatePath(`/product/${product.slug}`);
  return { success: true, message: "Товар видалено." };
}

export async function updateProductStockCountAction(
  productId: string,
  rawStockCount: string,
): Promise<ActionResult> {
  const isAdmin = await ensureAdminOrDeny("admin.product.update_stock.denied");
  if (!isAdmin) {
    return { success: false, message: "Немає доступу." };
  }

  const stockCount = Number(rawStockCount);
  if (!Number.isFinite(stockCount) || stockCount < 0 || stockCount > 9999) {
    return { success: false, message: "Некоректний залишок. Діапазон: 0-9999." };
  }

  const nextStockCount = Math.floor(stockCount);
  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true },
  });
  if (!existing) {
    return { success: false, message: "Товар не знайдено." };
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      stockCount: nextStockCount,
      inStock: nextStockCount > 0,
    },
  });

  await logAuditEvent({
    action: "admin.product.update_stock.success",
    actor: "admin",
    details: { productId, stockCount: nextStockCount },
  });

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  revalidatePath(`/product/${existing.slug}`);
  return { success: true, message: "Залишок оновлено." };
}

export async function updateProductAction(
  productId: string,
  payload: unknown,
): Promise<ActionResult> {
  try {
    const isAdmin = await ensureAdminOrDeny("admin.product.update.denied");
    if (!isAdmin) {
      return { success: false, message: "Немає доступу до виконання цієї дії." };
    }

    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true },
    });
    if (!existing) {
      return { success: false, message: "Товар не знайдено." };
    }

    const parsed = adminProductSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "Некоректні дані форми" };
    }

    const imageUrl = parsed.data.imageUrl.trim();
    if (!isValidImageUrl(imageUrl)) {
      return {
        success: false,
        message: "Вкажіть коректний URL зображення або завантажте файл.",
      };
    }

    const slugTaken = await prisma.product.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    });
    if (slugTaken && slugTaken.id !== productId) {
      return { success: false, message: "Товар з таким slug вже існує." };
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
    if (skuTaken && skuTaken.id !== productId) {
      sku = `${sku}-${Date.now().toString(36).toUpperCase()}`;
    }

    const technicalSpecs = specsRows.length > 0 ? specsRowsToTechnical(specsRows) : [];
    try {
      await prisma.product.update({
        where: { id: productId },
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
          technicalSpecs,
          warrantyMonths: parsed.data.warrantyMonths,
          imageUrl,
          imageUrls: extraImages,
          inStock: parsed.data.inStock,
        },
      });
    } catch (error) {
      if (isMongoReplicaSetError(error)) {
        await updateProductViaMongoDirect(productId, {
          name: parsed.data.name,
          slug: parsed.data.slug,
          description: parsed.data.description,
          price: parsed.data.price,
          category: parsed.data.category,
          brand,
          sku,
          highlights,
          specsRows,
          technicalSpecs,
          warrantyMonths: parsed.data.warrantyMonths,
          imageUrl,
          imageUrls: extraImages,
          inStock: parsed.data.inStock,
        });
      } else {
        throw error;
      }
    }

    await logAuditEvent({
      action: "admin.product.update.success",
      actor: "admin",
      details: {
        productId,
        oldSlug: existing.slug,
        newSlug: parsed.data.slug,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    revalidatePath(`/product/${existing.slug}`);
    revalidatePath(`/product/${parsed.data.slug}`);

    return { success: true, message: "Товар успішно оновлено." };
  } catch (error) {
    await logAuditEvent({
      action: "admin.product.update.failed",
      actor: "admin",
      severity: "error",
      details: { error: error instanceof Error ? error.message : "UNKNOWN_ERROR", productId },
    });
    return { success: false, message: "Не вдалося оновити товар. Спробуйте ще раз." };
  }
}
