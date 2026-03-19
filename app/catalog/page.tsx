import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ui/ProductCard";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { SearchBar } from "@/components/catalog/SearchBar";
import { SortSelect } from "@/components/catalog/SortSelect";
import { PaginationControls } from "@/components/catalog/PaginationControls";

type CatalogPageProps = {
  searchParams?: {
    category?: string;
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
  const ITEMS_PER_PAGE = 9;
  const selectedCategory = searchParams?.category?.trim() || undefined;
  const minPrice = toPositiveNumber(searchParams?.minPrice);
  const maxPrice = toPositiveNumber(searchParams?.maxPrice);
  const query = searchParams?.q?.trim() || "";
  const rawSort = searchParams?.sort === "price-desc" ? "price-desc" : "price-asc";
  const page = Number(searchParams?.page ?? "1");
  const currentPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

  const where: Prisma.ProductWhereInput = {};

  if (selectedCategory) {
    where.category = selectedCategory;
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
    where.name = {
      contains: query,
      mode: "insensitive",
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    rawSort === "price-desc" ? { price: "desc" } : { price: "asc" };

  const [categoryRows, totalProducts] = await Promise.all([
    prisma.product.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
    prisma.product.count({ where }),
  ]);

  const categories = categoryRows.map((row) => row.category).sort((a, b) => a.localeCompare(b, "uk"));
  const totalPages = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE));
  const boundedPage = Math.min(currentPage, totalPages);

  const products = await prisma.product.findMany({
    where,
    orderBy,
    take: ITEMS_PER_PAGE,
    skip: (boundedPage - 1) * ITEMS_PER_PAGE,
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8 space-y-2">
        <p className="ui-page-eyebrow">Каталог</p>
        <h1 className="font-display text-3xl font-normal text-white sm:text-4xl">Інструменти та обладнання</h1>
        <p className="ui-body max-w-2xl">
          Позиції з бази: фільтри, пошук і сортування за ціною — усе підтягується з каталогу «Октава».
        </p>
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchBar initialQuery={query} />
          <SortSelect value={rawSort} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px,1fr] lg:gap-8">
        <CatalogFilters
          categories={categories}
          selectedCategory={selectedCategory}
          minPrice={searchParams?.minPrice}
          maxPrice={searchParams?.maxPrice}
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
        </section>
      </div>
    </div>
  );
}
