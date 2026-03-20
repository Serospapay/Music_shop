import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { normalizeSpecsJson } from "@/lib/product-specs";
import { ProductPremiumPage } from "@/components/product/ProductPremiumPage";
import type { SoundRadarDatum } from "@/components/ui/SoundRadar";
import { ProductReviewsServer } from "@/components/product/ProductReviewsServer";

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

  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const specsLegacy = normalizeSpecsJson(product.specs);
  const imagesForJsonLd = [product.imageUrl, ...product.imageUrls].filter(Boolean);
  const skuResolved =
    product.sku?.trim() || `OCT-${product.slug.replace(/[^a-z0-9]+/gi, "").toUpperCase().slice(0, 20)}`;

  const radarData: SoundRadarDatum[] = [
    { subject: "Низькі (Bass)", score: 8, fullMark: 10 },
    { subject: "Середні (Mids)", score: 9, fullMark: 10 },
    { subject: "Високі (Treble)", score: 7, fullMark: 10 },
    { subject: "Сцена (Soundstage)", score: 6, fullMark: 10 },
    { subject: "Ізоляція", score: 8, fullMark: 10 },
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
          technicalSpecs: product.technicalSpecs,
          compatibility: product.compatibility,
          specsLegacy,
        }}
        related={related}
        soundProfile={radarData}
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
