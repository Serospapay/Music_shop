import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="ui-surface-muted w-full p-8 text-center sm:p-10">
        <p className="ui-page-eyebrow">404</p>
        <h1 className="mt-3 font-display text-3xl font-normal text-white">Інструмент не знайдено</h1>
        <p className="ui-body mt-3">
          Ймовірно, цей товар вже недоступний або посилання містить помилку.
        </p>
        <Link href="/catalog" className="ui-btn-primary mt-7 hover:scale-105">
          Повернутися до каталогу
        </Link>
      </div>
    </div>
  );
}
