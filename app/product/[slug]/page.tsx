import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductPDPExperience } from "@/components/product/ProductPDPExperience";
import type { RelatedProductDTO } from "@/components/product/ProductRelatedRail";

type RelatedRow = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  inStock: boolean;
  category: string;
};

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
    },
  });

  if (!product) {
    return defaultProductMetadata;
  }

  const shortDescription =
    product.description.length > 160
      ? `${product.description.slice(0, 157).trimEnd()}...`
      : product.description;

  return {
    title: product.name,
    description: shortDescription,
    openGraph: {
      title: product.name,
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

function mapRelated(rows: RelatedRow[]): RelatedProductDTO[] {
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    imageUrl: p.imageUrl,
    price: Number(p.price),
    inStock: p.inStock,
    category: p.category,
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: {
      slug: params.slug,
    },
  });

  if (!product) {
    notFound();
  }

  const relatedRows = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: product.id },
    },
    take: 12,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      price: true,
      inStock: true,
      category: true,
    },
  });
  const related = mapRelated(relatedRows);
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <ProductPDPExperience
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        category: product.category,
        imageUrl: product.imageUrl,
        inStock: product.inStock,
        createdAt: product.createdAt.toISOString(),
      }}
      related={related}
      siteOrigin={siteOrigin}
    />
  );
}
