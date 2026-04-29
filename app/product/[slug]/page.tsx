import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { normalizeSpecsJson } from "@/lib/product-specs";
import { ProductPremiumPage } from "@/components/product/ProductPremiumPage";
import type { SoundRadarDatum } from "@/components/ui/SoundRadar";
import { ProductReviewsServer } from "@/components/product/ProductReviewsServer";
import { getCurrentUser } from "@/lib/user-auth";
import { getPersonalizedProductsForUser } from "@/lib/personalization";
import { parseRecentlyViewedCookie, RECENTLY_VIEWED_COOKIE_NAME } from "@/lib/recently-viewed";

type ProductPageProps = {
  params: {
    slug: string;
  };
};

const defaultProductMetadata: Metadata = {
  title: "Товар не знайдено",
  description: "Інструмент не знайдено або він більше недоступний у каталозі.",
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      description: true,
      imageUrl: true,
      slug: true,
      brand: true,
    },
  });

  if (!product) {
    return defaultProductMetadata;
  }

  const shortDescription =
    product.description.length > 160
      ? `${product.description.slice(0, 157).trimEnd()}...`
      : product.description;

  const brand = product.brand.trim();
  const title = brand ? `${product.name} — ${brand}` : product.name;

  return {
    title,
    description: shortDescription,
    openGraph: {
      title,
      description: shortDescription,
      type: "website",
      url: `/product/${product.slug}`,
      images: [
        {
          url: product.imageUrl,
          alt: product.name,
        },
      ],
    },
  };
}

type ProductDbRow = NonNullable<Awaited<ReturnType<typeof prisma.product.findUnique>>>;

type ProductWithJsonFields = ProductDbRow & {
  stockCount: number;
  technicalSpecs: unknown;
  compatibility: unknown;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const recentIdsRaw = cookieStore.get(RECENTLY_VIEWED_COOKIE_NAME)?.value;
  const recentIds = parseRecentlyViewedCookie(recentIdsRaw).slice(0, 8);

  const productRaw = await prisma.product.findUnique({
    where: {
      slug: params.slug,
    },
  });

  if (!productRaw) {
    notFound();
  }

  const product = productRaw as ProductWithJsonFields;

  const related = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: product.id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const [recentProductsUnsorted, personalized] = await Promise.all([
    recentIds.length > 0
      ? prisma.product.findMany({
          where: { id: { in: recentIds.filter((id) => id !== product.id) } },
          take: recentIds.length,
        })
      : Promise.resolve([]),
    getPersonalizedProductsForUser({
      userId: user?.id,
      excludeProductIds: [product.id],
      limit: 4,
    }),
  ]);

  const recentById = new Map(recentProductsUnsorted.map((row) => [row.id, row]));
  const recentlyViewedProducts = recentIds
    .filter((id) => id !== product.id)
    .map((id) => recentById.get(id))
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  const wishlistItem = user
    ? await prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId: user.id,
            productId: product.id,
          },
        },
        select: { id: true },
      })
    : null;

  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const specsLegacy = normalizeSpecsJson(product.specs);
  const imagesForJsonLd = [product.imageUrl, ...product.imageUrls].filter(Boolean);
  const skuResolved =
    product.sku?.trim() || `OCT-${product.slug.replace(/[^a-z0-9]+/gi, "").toUpperCase().slice(0, 20)}`;

  const specCompleteness = Math.min(10, Math.max(4, specsLegacy.length + 3));
  const availabilityScore = product.inStock ? (product.stockCount > 12 ? 9 : 7) : 3;
  const reliabilityScore = Math.min(10, Math.max(5, Math.round(product.warrantyMonths / 3)));
  const valueScore = product.price <= 20000 ? 8 : product.price <= 60000 ? 7 : 6;
  const versatilityScore =
    product.category === "Клавішні" || product.category === "Студія" || product.category === "Аксесуари"
      ? 8
      : 7;

  const radarData: SoundRadarDatum[] = [
    { subject: "Оснащення", score: specCompleteness, fullMark: 10 },
    { subject: "Наявність", score: availabilityScore, fullMark: 10 },
    { subject: "Надійність", score: reliabilityScore, fullMark: 10 },
    { subject: "Цінність", score: valueScore, fullMark: 10 },
    { subject: "Універсальність", score: versatilityScore, fullMark: 10 },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: skuResolved,
    image: imagesForJsonLd,
    brand: product.brand.trim()
      ? {
          "@type": "Brand",
          name: product.brand.trim(),
        }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `${siteOrigin.replace(/\/$/, "")}/product/${product.slug}`,
      priceCurrency: "UAH",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPremiumPage
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: Number(product.price),
          category: product.category,
          brand: product.brand,
          sku: skuResolved,
          imageUrl: product.imageUrl,
          imageUrls: product.imageUrls ?? [],
          inStock: product.inStock,
          stockCount: product.stockCount,
          warrantyMonths: product.warrantyMonths,
          highlights: product.highlights ?? [],
          technicalSpecs: product.technicalSpecs,
          compatibility: product.compatibility,
          specsLegacy,
        }}
        related={related}
        soundProfile={radarData}
        recentlyViewed={recentlyViewedProducts}
        personalized={personalized}
        wishlist={{
          canManage: Boolean(user),
          initiallyInWishlist: Boolean(wishlistItem),
          loginHref: `/login?next=/product/${encodeURIComponent(product.slug)}`,
        }}
      />
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Suspense
          fallback={<p className="py-12 text-center text-sm text-zinc-500">Завантаження відгуків...</p>}
        >
          <ProductReviewsServer productId={product.id} productSlug={product.slug} />
        </Suspense>
      </div>
    </>
  );
}
