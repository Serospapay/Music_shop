import { Prisma, type Product } from "@prisma/client";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ui/ProductCard";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { SearchBar } from "@/components/catalog/SearchBar";
import { SortSelect } from "@/components/catalog/SortSelect";
import { PaginationControls } from "@/components/catalog/PaginationControls";
import { getCurrentUser } from "@/lib/user-auth";
import { getPersonalizedProductsForUser } from "@/lib/personalization";
import { parseRecentlyViewedCookie, RECENTLY_VIEWED_COOKIE_NAME } from "@/lib/recently-viewed";
import { ProductRecommendationSection } from "@/components/personalization/ProductRecommendationSection";

type CatalogPageProps = {
  searchParams?: {
    category?: string;
    brand?: string;
    inStock?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    q?: string;
    sort?: string;
  };
};

const toPositiveNumber = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const recentIdsRaw = cookieStore.get(RECENTLY_VIEWED_COOKIE_NAME)?.value;
  const recentIds = parseRecentlyViewedCookie(recentIdsRaw).slice(0, 8);

  const ITEMS_PER_PAGE = 9;
  const selectedCategory = searchParams?.category?.trim() || undefined;
  const selectedBrand = searchParams?.brand?.trim() || undefined;
  const inStockOnly = searchParams?.inStock === "1";
  const minPrice = toPositiveNumber(searchParams?.minPrice);
  const maxPrice = toPositiveNumber(searchParams?.maxPrice);
  const query = searchParams?.q?.trim() || "";
  const rawSort =
    searchParams?.sort === "price-desc" ||
    searchParams?.sort === "newest" ||
    searchParams?.sort === "name-asc"
      ? searchParams.sort
      : "price-asc";
  const page = Number(searchParams?.page ?? "1");
  const currentPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

  const where: Prisma.ProductWhereInput = {};

  if (selectedCategory) {
    where.category = selectedCategory;
  }

  if (selectedBrand) {
    where.brand = selectedBrand;
  }

  if (inStockOnly) {
    where.inStock = true;
  }

  const priceFilter: Prisma.FloatFilter = {};
  if (minPrice !== undefined) {
    priceFilter.gte = minPrice;
  }
  if (maxPrice !== undefined) {
    priceFilter.lte = maxPrice;
  }
  if (Object.keys(priceFilter).length > 0) {
    where.price = priceFilter;
  }

  if (query) {
    where.OR = [
      {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        brand: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query,
          mode: "insensitive",
        },
      },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    rawSort === "price-desc"
      ? { price: "desc" }
      : rawSort === "newest"
        ? { createdAt: "desc" }
        : rawSort === "name-asc"
          ? { name: "asc" }
          : { price: "asc" };

  const [categoryRows, brandRows, totalProducts, priceBounds, recentProductsUnsorted, personalized] =
    await Promise.all([
    prisma.product.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
    prisma.product.findMany({
      distinct: ["brand"],
      where: {
        brand: {
          not: "",
        },
      },
      select: { brand: true },
      orderBy: { brand: "asc" },
    }),
    prisma.product.count({ where }),
    prisma.product.aggregate({
      _min: { price: true },
      _max: { price: true },
    }),
    recentIds.length > 0
      ? prisma.product.findMany({
          where: { id: { in: recentIds } },
          take: recentIds.length,
        })
      : Promise.resolve([]),
    getPersonalizedProductsForUser({
      userId: user?.id,
      limit: 4,
    }),
  ]);

  const categories = categoryRows.map((row) => row.category).sort((a, b) => a.localeCompare(b, "uk"));
  const brands = brandRows.map((row) => row.brand).sort((a, b) => a.localeCompare(b, "uk"));
  const totalPages = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE));
  const boundedPage = Math.min(currentPage, totalPages);
  const hasFilters = Boolean(
    selectedCategory || selectedBrand || inStockOnly || minPrice !== undefined || maxPrice !== undefined,
  );
  const catalogMinPrice = priceBounds._min.price ? Math.floor(priceBounds._min.price) : 0;
  const catalogMaxPrice = priceBounds._max.price ? Math.ceil(priceBounds._max.price) : 0;

  const products = await prisma.product.findMany({
    where,
    orderBy,
    take: ITEMS_PER_PAGE,
    skip: (boundedPage - 1) * ITEMS_PER_PAGE,
  });

  const recentById = new Map(recentProductsUnsorted.map((product) => [product.id, product]));
  const recentlyViewedProducts = recentIds
    .map((id) => recentById.get(id))
    .filter((product): product is Product => Boolean(product));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8 space-y-2">
        <p className="ui-page-eyebrow">Каталог</p>
        <h1 className="font-display text-3xl font-normal text-white sm:text-4xl">Інструменти та обладнання</h1>
        <p className="ui-body max-w-2xl">
          Позиції з бази: розширені фільтри (категорія, бренд, ціна, наявність), пошук та сортування.
        </p>
        <p className="text-sm text-zinc-400">
          Знайдено: <span className="font-semibold text-zinc-200">{totalProducts}</span>
          {hasFilters ? " (з урахуванням активних фільтрів)" : " (усі товари каталогу)"}.
        </p>
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchBar initialQuery={query} />
          <SortSelect value={rawSort} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px,1fr] lg:gap-8">
        <CatalogFilters
          categories={categories}
          brands={brands}
          selectedCategory={selectedCategory}
          selectedBrand={selectedBrand}
          inStockOnly={inStockOnly}
          minPrice={searchParams?.minPrice}
          maxPrice={searchParams?.maxPrice}
          priceBounds={{ min: catalogMinPrice, max: catalogMaxPrice }}
        />

        <section className="space-y-5">
          {products.length === 0 ? (
            <div className="ui-surface-muted p-10 text-center">
              <p className="text-lg font-medium text-zinc-200">За вашим запитом нічого не знайдено</p>
              <p className="mt-2 text-sm text-zinc-400">
                Спробуйте змінити категорію або розширити діапазон ціни.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <PaginationControls currentPage={boundedPage} totalPages={totalPages} />
            </>
          )}

          <ProductRecommendationSection
            title="Нещодавно переглянуті"
            subtitle="Поверніться до товарів, які ви відкривали останніми."
            products={recentlyViewedProducts}
          />

          {user ? (
            <ProductRecommendationSection
              title="Схожі на збережені у wishlist"
              subtitle="Підібрали моделі за категоріями та брендами з вашого списку бажань."
              products={personalized.wishlistInspired}
            />
          ) : null}

          <ProductRecommendationSection
            title="Рекомендовано для вас"
            subtitle={
              user
                ? "Персональна добірка на базі ваших збережень і покупок."
                : "Популярні та актуальні товари каталогу."
            }
            products={personalized.recommendedForYou}
          />
        </section>
      </div>
    </div>
  );
}
