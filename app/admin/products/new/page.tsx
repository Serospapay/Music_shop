import Link from "next/link";
import { AddProductForm } from "@/components/admin/AddProductForm";

export default function AdminNewProductPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ui-page-eyebrow">Адмін / Товари</p>
          <h1 className="mt-2 font-display text-3xl font-normal text-white sm:text-4xl">Новий товар</h1>
        </div>
        <Link href="/admin/products" className="ui-btn-outline hover:scale-105">
          До списку товарів
        </Link>
      </div>

      <section className="ui-surface p-6 sm:p-8">
        <AddProductForm />
      </section>
    </div>
  );
}
