import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPriceUah } from "@/lib/format";
import { AdminProductActions } from "@/components/admin/AdminProductActions";

type AdminProductsPageProps = {
  searchParams?: {
    q?: string;
    stock?: string;
    category?: string;
    page?: string;
  };
};

function parsePositiveInt(value?: string) {
  if (!value) {
    return 1;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }
  return Math.floor(parsed);
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const ITEMS_PER_PAGE = 20;
  const q = searchParams?.q?.trim() ?? "";
  const stockParam =
    searchParams?.stock === "in" ||
    searchParams?.stock === "out" ||
    searchParams?.stock === "low" ||
    searchParams?.stock === "all"
      ? searchParams.stock
      : "all";
  const selectedCategory = searchParams?.category?.trim() ?? "";
  const requestedPage = parsePositiveInt(searchParams?.page);

  const where: Prisma.ProductWhereInput = {};
  if (selectedCategory) {
    where.category = selectedCategory;
  }
  if (stockParam === "in") {
    where.inStock = true;
  } else if (stockParam === "out") {
    where.inStock = false;
  } else if (stockParam === "low") {
    where.inStock = true;
    where.stockCount = { lte: 5 };
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ];
  }

  const [categoryRows, totalProducts, totalAll, totalInStock, totalOutOfStock, totalLowStock] =
    await Promise.all([
      prisma.product.findMany({
        distinct: ["category"],
        select: { category: true },
        orderBy: { category: "asc" },
      }),
      prisma.product.count({ where }),
      prisma.product.count(),
      prisma.product.count({ where: { inStock: true } }),
      prisma.product.count({ where: { inStock: false } }),
      prisma.product.count({ where: { inStock: true, stockCount: { lte: 5 } } }),
    ]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    include: {
      _count: {
        select: {
          orderItems: true,
          reviews: true,
        },
      },
    },
  });

  const categories = categoryRows.map((row) => row.category);
  const hasFilters = Boolean(q || selectedCategory || stockParam !== "all");
  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (q) {
      params.set("q", q);
    }
    if (selectedCategory) {
      params.set("category", selectedCategory);
    }
    if (stockParam !== "all") {
      params.set("stock", stockParam);
    }
    params.set("page", String(page));
    return `/admin/products?${params.toString()}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ui-page-eyebrow">Адмін / Товари</p>
          <h1 className="mt-2 font-display text-3xl font-normal text-white sm:text-4xl">Управління товарами</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Пошук, фільтри, керування наявністю/ціною/залишком і контроль активності по товарах.
          </p>
        </div>
        <Link href="/admin/products/new" className="ui-btn-primary-compact hover:scale-105">
          Додати товар
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="ui-surface-inset p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">У каталозі</p>
          <p className="mt-2 text-2xl font-semibold text-white">{totalAll}</p>
        </div>
        <div className="ui-surface-inset p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">В наявності</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">{totalInStock}</p>
        </div>
        <div className="ui-surface-inset p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Немає в наявності</p>
          <p className="mt-2 text-2xl font-semibold text-rose-300">{totalOutOfStock}</p>
        </div>
        <div className="ui-surface-inset p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Критично низький залишок</p>
          <p className="mt-2 text-2xl font-semibold text-amber-300">{totalLowStock}</p>
        </div>
      </section>

      <section className="ui-surface p-4 sm:p-5">
        <form method="get" className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr,220px,220px,auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            className="ui-input"
            placeholder="Пошук: назва, slug, бренд, SKU, категорія"
          />
          <select
            name="category"
            defaultValue={selectedCategory}
            className="ui-input"
            aria-label="Фільтр категорії товарів"
          >
            <option value="">Усі категорії</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            name="stock"
            defaultValue={stockParam}
            className="ui-input"
            aria-label="Фільтр статусу наявності"
          >
            <option value="all">Усі статуси</option>
            <option value="in">Лише в наявності</option>
            <option value="out">Лише без наявності</option>
            <option value="low">Критичний залишок (&lt;= 5)</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="ui-btn-primary-compact h-[42px] px-4">
              Застосувати
            </button>
            {hasFilters ? (
              <Link href="/admin/products" className="ui-btn-outline-compact h-[42px] px-4">
                Скинути
              </Link>
            ) : null}
          </div>
        </form>
        <p className="mt-3 text-sm text-zinc-400">
          Знайдено: <span className="font-semibold text-zinc-200">{totalProducts}</span>
          {hasFilters ? " за активними фільтрами." : " у поточному списку."}
        </p>
      </section>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Назва</TableHead>
            <TableHead>Бренд / Категорія</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Ціна</TableHead>
            <TableHead>Наявність</TableHead>
            <TableHead>Продажі / Відгуки</TableHead>
            <TableHead>Створено</TableHead>
            <TableHead className="text-right">Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium text-white">{product.name}</TableCell>
              <TableCell>
                <p>{product.brand.trim() || "—"}</p>
                <p className="text-xs text-zinc-500">{product.category}</p>
              </TableCell>
              <TableCell className="text-zinc-400">{product.slug}</TableCell>
              <TableCell className="font-mono text-xs text-zinc-400">{product.sku?.trim() || "—"}</TableCell>
              <TableCell>{formatPriceUah(product.price)}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    product.inStock ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {product.inStock ? "В наявності" : "Немає"}
                </span>
                <p className="mt-1 text-xs text-zinc-500">Залишок: {product.stockCount}</p>
              </TableCell>
              <TableCell className="text-xs text-zinc-400">
                <p>Продажі: {product._count.orderItems}</p>
                <p className="mt-1">Відгуки: {product._count.reviews}</p>
              </TableCell>
              <TableCell className="text-zinc-400">
                {product.createdAt.toLocaleDateString("uk-UA")}
              </TableCell>
              <TableCell className="w-[220px] align-top">
                <div className="space-y-2">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="inline-flex text-xs text-sky-300 hover:text-sky-200"
                  >
                    Редагувати
                  </Link>
                  <Link
                    href={`/product/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex text-xs text-brand-300 hover:text-brand-200"
                  >
                    Відкрити товар
                  </Link>
                  <AdminProductActions
                    productId={product.id}
                    productName={product.name}
                    inStock={product.inStock}
                    price={product.price}
                    stockCount={product.stockCount}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}

          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center text-zinc-400">
                За поточними фільтрами товари не знайдені.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
          <p>
            Сторінка <span className="font-semibold text-zinc-200">{currentPage}</span> з{" "}
            <span className="font-semibold text-zinc-200">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Link
              href={buildPageHref(Math.max(1, currentPage - 1))}
              className={`ui-btn-outline-compact ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              Назад
            </Link>
            <Link
              href={buildPageHref(Math.min(totalPages, currentPage + 1))}
              className={`ui-btn-outline-compact ${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}`}
            >
              Вперед
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
