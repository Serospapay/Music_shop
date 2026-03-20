import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ui/ProductCard";
import { HomeIntro } from "@/components/home/HomeIntro";
import { ProductCarousel3D, type CarouselSlide } from "@/components/home/ProductCarousel3D";
import { HomePracticalInfo } from "@/components/home/HomePracticalInfo";
import type { Product } from "@prisma/client";

export const dynamic = "force-dynamic";

async function getCarouselSlides(): Promise<CarouselSlide[]> {
  const rows = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      price: true,
      category: true,
    },
  });
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    imageUrl: p.imageUrl,
    category: p.category,
    price: Number(p.price),
  }));
}

async function getLatestProducts(): Promise<Product[]> {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
  });
}

async function getCatalogStats() {
  const [productCount, categoryRows] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
  ]);
  const categories = categoryRows.map((r) => r.category).filter(Boolean);
  return {
    productCount,
    categories,
    categoryCount: categories.length,
  };
}

export default async function HomePage() {
  const [carouselSlides, latestProducts, stats] = await Promise.all([
    getCarouselSlides(),
    getLatestProducts(),
    getCatalogStats(),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-16 px-4 py-8 sm:px-6 lg:space-y-20 lg:px-8 lg:py-12">
      <HomeIntro
        productCount={stats.productCount}
        categoryCount={stats.categoryCount}
        categories={stats.categories}
      />

      <ProductCarousel3D slides={carouselSlides} />

      <HomePracticalInfo />

      <section className="space-y-6">
        <div>
          <h2 className="ui-section-title">Останні додані в базу</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Чотири останні записи за датою створення — зручно перевірити, що саме нещодавно з&apos;явилося в каталозі.
          </p>
        </div>

        {latestProducts.length === 0 ? (
          <div className="ui-surface-muted p-8 text-center">
            <p className="text-lg font-medium text-zinc-200">У каталозі ще немає товарів</p>
            <p className="mt-2 text-sm text-zinc-400">
              Додайте позиції через адмін-панель або виконайте{" "}
              <code className="rounded border border-brand-500/20 bg-surface-900 px-1.5 py-0.5 text-xs text-brand-200">
                npm run db:seed
              </code>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
