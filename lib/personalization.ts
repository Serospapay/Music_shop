import type { Product } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type PersonalizedOptions = {
  userId?: string | null;
  excludeProductIds?: string[];
  limit?: number;
};

type PersonalizedResult = {
  wishlistInspired: Product[];
  recommendedForYou: Product[];
};

function unique(values: Iterable<string>) {
  return Array.from(new Set(Array.from(values).filter(Boolean)));
}

export async function getPersonalizedProductsForUser({
  userId,
  excludeProductIds = [],
  limit = 4,
}: PersonalizedOptions): Promise<PersonalizedResult> {
  const exclusion = new Set(excludeProductIds);

  if (!userId) {
    const fallback = await prisma.product.findMany({
      where: {
        inStock: true,
        ...(exclusion.size > 0 ? { id: { notIn: Array.from(exclusion) } } : {}),
      },
      orderBy: [{ createdAt: "desc" }],
      take: limit,
    });
    return { wishlistInspired: [], recommendedForYou: fallback };
  }

  const [wishlistItems, recentOrders] = await Promise.all([
    prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            category: true,
            brand: true,
          },
        },
      },
      take: 30,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { userId },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                category: true,
                brand: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const wishlistProductIds = wishlistItems.map((row) => row.productId);
  wishlistProductIds.forEach((id) => exclusion.add(id));

  const wishlistCategories = unique(wishlistItems.map((row) => row.product.category));
  const wishlistBrands = unique(
    wishlistItems.map((row) => row.product.brand.trim()).filter((brand) => brand.length > 0),
  );

  const wishlistInspired =
    wishlistCategories.length > 0 || wishlistBrands.length > 0
      ? await prisma.product.findMany({
          where: {
            inStock: true,
            id: { notIn: Array.from(exclusion) },
            OR: [
              ...(wishlistCategories.length > 0 ? [{ category: { in: wishlistCategories } }] : []),
              ...(wishlistBrands.length > 0 ? [{ brand: { in: wishlistBrands } }] : []),
            ],
          },
          orderBy: [{ createdAt: "desc" }],
          take: limit,
        })
      : [];

  wishlistInspired.forEach((item) => exclusion.add(item.id));

  const orderCategories = unique(
    recentOrders.flatMap((order) => order.items.map((item) => item.product?.category ?? "")),
  );
  const orderBrands = unique(
    recentOrders.flatMap((order) => order.items.map((item) => item.product?.brand.trim() ?? "")),
  );
  const prefCategories = unique([...wishlistCategories, ...orderCategories]);
  const prefBrands = unique([...wishlistBrands, ...orderBrands]);

  let recommendedForYou =
    prefCategories.length > 0 || prefBrands.length > 0
      ? await prisma.product.findMany({
          where: {
            inStock: true,
            id: { notIn: Array.from(exclusion) },
            OR: [
              ...(prefCategories.length > 0 ? [{ category: { in: prefCategories } }] : []),
              ...(prefBrands.length > 0 ? [{ brand: { in: prefBrands } }] : []),
            ],
          },
          orderBy: [{ createdAt: "desc" }],
          take: limit,
        })
      : [];

  if (recommendedForYou.length < limit) {
    recommendedForYou.forEach((item) => exclusion.add(item.id));
    const extra = await prisma.product.findMany({
      where: {
        inStock: true,
        id: { notIn: Array.from(exclusion) },
      },
      orderBy: [{ createdAt: "desc" }],
      take: limit - recommendedForYou.length,
    });
    recommendedForYou = [...recommendedForYou, ...extra];
  }

  return {
    wishlistInspired,
    recommendedForYou,
  };
}
