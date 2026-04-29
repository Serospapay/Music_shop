import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddProductForm } from "@/components/admin/AddProductForm";
import { normalizeSpecsJson } from "@/lib/product-specs";

type AdminEditProductPageProps = {
  params: {
    productId: string;
  };
};

export default async function AdminEditProductPage({ params }: AdminEditProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      category: true,
      brand: true,
      sku: true,
      highlights: true,
      specs: true,
      technicalSpecs: true,
      warrantyMonths: true,
      imageUrl: true,
      imageUrls: true,
      inStock: true,
    },
  });

  if (!product) {
    notFound();
  }

  const specsRows = normalizeSpecsJson(product.specs ?? product.technicalSpecs);
  const specsText = specsRows.map((row) => `${row.label}: ${row.value}`).join("\n");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ui-page-eyebrow">Адмін / Товари</p>
          <h1 className="mt-2 font-display text-3xl font-normal text-white sm:text-4xl">
            Редагування товару
          </h1>
          <p className="mt-2 text-sm text-zinc-400">Оновіть будь-які поля і збережіть зміни в базі.</p>
        </div>
        <Link href="/admin/products" className="ui-btn-outline hover:scale-105">
          До списку товарів
        </Link>
      </div>

      <section className="ui-surface p-6 sm:p-8">
        <AddProductForm
          mode="edit"
          productId={product.id}
          initialValues={{
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: Number(product.price),
            category: product.category,
            brand: product.brand ?? "",
            sku: product.sku ?? "",
            highlightsText: (product.highlights ?? []).join("\n"),
            specsText,
            warrantyMonths: product.warrantyMonths ?? 12,
            imageUrl: product.imageUrl,
            imageUrlsText: (product.imageUrls ?? []).join("\n"),
            inStock: Boolean(product.inStock),
          }}
        />
      </section>
    </div>
  );
}
