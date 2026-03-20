"use client";

import { CreditCard, ShieldCheck, Truck } from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "Доставка по Україні",
    text: "Нова Пошта / Укрпошта — після підтвердження замовлення менеджером.",
  },
  {
    icon: CreditCard,
    title: "Оплата",
    text: "Реквізити для переказу або картка; дані в формі замовлення обробляються безпечно.",
  },
  {
    icon: ShieldCheck,
    title: "Дані замовлення",
    text: "Email і телефон для зв’язку; історія в адмін-панелі для підтримки.",
  },
];

type ProductCommerceTrustProps = {
  warrantyMonths: number;
};

/** Без окремих рамок на кожен пункт — один спокійний блок, читабельний текст */
export function ProductCommerceTrust({ warrantyMonths }: ProductCommerceTrustProps) {
  return (
    <div className="space-y-5 rounded-2xl bg-brand-500/[0.06] px-4 py-5 sm:px-5">
      <ul className="space-y-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3.5">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-400/90" strokeWidth={1.75} aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug text-zinc-100">{title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{text}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="border-t border-brand-500/15 pt-4 text-sm leading-relaxed text-emerald-200/90">
        <span className="font-semibold text-emerald-100">Гарантія: </span>
        {warrantyMonths} міс. з моменту передачі товару. Збережіть номер замовлення та документи.
      </p>
    </div>
  );
}
