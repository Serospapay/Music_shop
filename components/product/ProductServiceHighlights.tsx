"use client";

import { Headphones, Package, Truck } from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "Логістика та контроль",
    body: "Після оформлення замовлення ви отримуєте підтвердження на email. Менеджер узгоджує спосіб доставки, термін та фінальну суму перед оплатою.",
  },
  {
    icon: Package,
    title: "Наявність і комплектація",
    body: "Статус «в наявності» ведеться в адмін-панелі. Перед відправкою перевіряємо комплектацію та цілісність упаковки.",
  },
  {
    icon: Headphones,
    title: "Підтримка після покупки",
    body: "Номер замовлення та контакти зберігаються в системі — швидко відповімо на питання щодо гарантії та сервісу.",
  },
];

export function ProductServiceHighlights() {
  return (
    <section className="border-t border-brand-500/10 pt-10">
      <h2 className="font-display text-xl font-normal text-white sm:text-2xl">Чому з нами зручно</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
        Прозорий процес від кошика до отримання замовлення.
      </p>
      <ul className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-8">
        {items.map(({ icon: Icon, title, body }) => (
          <li key={title} className="min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/12 text-brand-200">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
