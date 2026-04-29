import Link from "next/link";

type CheckoutSuccessPageProps = {
  searchParams?: { orderId?: string };
};

export default function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const orderId = searchParams?.orderId?.trim();

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="ui-surface w-full p-8 text-center sm:p-10">
        <p className="ui-page-eyebrow">Готово</p>
        <h1 className="mt-3 font-display text-3xl font-normal text-white sm:text-4xl">Дякуємо за замовлення!</h1>
        <p className="ui-body mt-3">
          Ваше замовлення успішно створене і передане адміністратору в чергу обробки. Найближчим часом менеджер
          зв&apos;яжеться з вами для підтвердження деталей доставки.
        </p>
        {orderId ? (
          <p className="ui-surface-inset mt-6 px-4 py-3 text-sm text-zinc-200">
            Номер замовлення: <span className="font-mono font-medium text-brand-100">{orderId}</span>
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/catalog" className="ui-btn-primary hover:scale-105">
            Повернутися до каталогу
          </Link>
          <Link href="/" className="ui-btn-outline hover:scale-105">
            На головну
          </Link>
        </div>
      </section>
    </div>
  );
}
