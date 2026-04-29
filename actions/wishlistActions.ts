"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export type WishlistActionResult =
  | { success: true; inWishlist: boolean; message: string }
  | { success: false; message: string };

async function ensureUser() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  return user;
}

export async function toggleWishlistAction(productId: string): Promise<WishlistActionResult> {
  const user = await ensureUser();
  if (!user) {
    return { success: false, message: "Увійдіть у акаунт, щоб додати товар у список бажань." };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true },
  });
  if (!product) {
    return { success: false, message: "Товар не знайдено." };
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId,
      },
    },
    select: { id: true },
  });

  let inWishlist = false;
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    inWishlist = false;
  } else {
    await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        productId,
      },
    });
    inWishlist = true;
  }

  revalidatePath(`/product/${product.slug}`);
  revalidatePath("/account");
  revalidatePath("/catalog");

  return {
    success: true,
    inWishlist,
    message: inWishlist ? "Товар додано у список бажань." : "Товар прибрано зі списку бажань.",
  };
}

export async function removeWishlistItemAction(productId: string): Promise<WishlistActionResult> {
  const user = await ensureUser();
  if (!user) {
    return { success: false, message: "Сесія завершилась. Увійдіть повторно." };
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId,
      },
    },
    select: { id: true, product: { select: { slug: true } } },
  });
  if (!existing) {
    return { success: true, inWishlist: false, message: "Товар уже відсутній у списку бажань." };
  }

  await prisma.wishlistItem.delete({
    where: { id: existing.id },
  });

  revalidatePath("/account");
  revalidatePath(`/product/${existing.product.slug}`);
  revalidatePath("/catalog");

  return { success: true, inWishlist: false, message: "Товар прибрано зі списку бажань." };
}
