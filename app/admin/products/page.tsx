import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPriceUah } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ui-page-eyebrow">Адмін / Товари</p>
          <h1 className="mt-2 font-display text-3xl font-normal text-white sm:text-4xl">Управління товарами</h1>
        </div>
        <Link href="/admin/products/new" className="ui-btn-primary-compact hover:scale-105">
          Додати товар
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Назва</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Категорія</TableHead>
            <TableHead>Ціна</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Створено</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium text-white">{product.name}</TableCell>
              <TableCell className="text-zinc-400">{product.slug}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{formatPriceUah(product.price)}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    product.inStock ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {product.inStock ? "В наявності" : "Немає"}
                </span>
              </TableCell>
              <TableCell className="text-zinc-400">
                {product.createdAt.toLocaleDateString("uk-UA")}
              </TableCell>
            </TableRow>
          ))}

          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-zinc-400">
                Наразі немає жодного товару.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
