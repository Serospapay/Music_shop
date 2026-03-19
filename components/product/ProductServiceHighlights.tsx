"use client";

import { Headphones, Package, Truck } from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "Доставка",
    body: "Адресу ви вказуєте при оформленні; деталі узгоджуємо після заявки — без прихованих кроків у кошику.",
  },
  {
    icon: Package,
    title: "Наявність",
    body: "Статус «в наявності» оновлюється в адмін-панелі. Перед оплатою фінальну комплектацію завжди можна уточнити.",
  },
  {
    icon: Headphones,
    title: "Підтримка",
    body: "Замовлення зберігається в системі з вашим email і телефоном — зручно продовжити діалог з менеджером.",
  },
];

export function ProductServiceHighlights() {
  return (
    <section className="mt-14 border-t border-brand-500/10 pt-12">
      <h2 className="font-display text-xl font-normal text-white sm:text-2xl">Як це працює</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Коротко про логіку магазину — без маркетингових обіцянок, лише те, що реально відбувається після кнопки «Додати в кошик».
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {items.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="rounded-2xl border border-brand-500/12 bg-surface-950/60 p-5 transition hover:border-brand-400/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-200">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
