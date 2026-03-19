import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Про нас",
  description:
    "Хто ми, як працює каталог і замовлення в магазині Октава — без зайвого маркетингу.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-10 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-brand-500/80">Про нас</p>
        <h1 className="mt-3 font-display text-3xl font-normal text-white sm:text-4xl">Магазин «Октава»</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
          Це навчальний / дипломний проєкт інтернет-магазину музичних інструментів: каталог на Next.js, база MongoDB,
          кошик і оформлення замовлення. Мета — показати повний цикл від картки товару до запису замовлення в базі, а не
          «продати будь-яку ціну».
        </p>
      </div>

      <section className="ui-surface-muted space-y-4 p-6">
        <h2 className="text-lg font-semibold text-white">Що ви бачите на сайті</h2>
        <ul className="space-y-3 text-sm leading-relaxed text-zinc-400">
          <li className="border-l-2 border-brand-500/30 pl-3">
            Каталог з фільтрами та пошуком — дані з бази, без статичних заглушок.
          </li>
          <li className="border-l-2 border-accent-500/25 pl-3">
            Сторінка товару з ціною в гривнях і статусом наявності; кошик зберігається у браузері.
          </li>
          <li className="border-l-2 border-brand-500/30 pl-3">
            Адмін-панель для додавання товарів і перегляду замовлень — доступ за паролем з налаштувань сервера.
          </li>
        </ul>
      </section>

      <section className="space-y-4 text-sm leading-relaxed text-zinc-400">
        <h2 className="text-lg font-semibold text-white">Контакти</h2>
        <p>
          Для демонстрації проєкту контактні телефон і email можна винести сюди після узгодження з керівником. Зараз
          зв&apos;язок імітується через поля форми оформлення замовлення (email і телефон потрапляють у запис замовлення).
        </p>
      </section>

      <Link href="/catalog" className="ui-btn-primary">
        До каталогу
      </Link>
    </div>
  );
}
