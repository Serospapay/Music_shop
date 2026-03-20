"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faq = [
  {
    q: "Чи можна зарезервувати товар перед оплатою?",
    a: "Після оформлення замовлення менеджер зв’яжеться з вами для підтвердження наявності, комплектації та умов оплати. Поки не підтверджено — резерв не гарантується.",
  },
  {
    q: "Як дізнатися актуальну ціну?",
    a: "Ціна на сайті відображається на момент перегляду. Під час коливань курсу або акцій фінальна сума може бути уточнена в листі або дзвінку перед оплатою.",
  },
  {
    q: "Що робити, якщо товар не підійшов?",
    a: "Умови повернення/обміну залежать від категорії товару та стану упаковки. Деталі надає менеджер під час підтвердження замовлення — збережіть номер замовлення.",
  },
  {
    q: "Чи є гарантія на інструменти?",
    a: "Гарантійний термін вказано на сторінці товару. Для сервісу та гарантійних випадків знадобляться документи про покупку та серійний номер (якщо зазначено виробником).",
  },
];

export function ProductPdpFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-brand-500/10 pt-10">
      <h2 className="font-display text-xl font-normal text-white sm:text-2xl">Питання та відповіді</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
        Коротко про покупку в «Октаві». Деталі — у листі після оформлення замовлення.
      </p>
      <ul className="mt-8 space-y-2">
        {faq.map((item, idx) => {
          const isOpen = open === idx;
          return (
            <li key={item.q} className="overflow-hidden rounded-xl border border-brand-500/12 bg-surface-900/40">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-[15px] font-medium text-white transition hover:bg-white/[0.03]"
                aria-expanded={isOpen}
              >
                <span className="min-w-0 pr-2">{item.q}</span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-4 w-4 shrink-0 text-brand-400" strokeWidth={2} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="border-t border-brand-500/10"
                  >
                    <p className="px-4 pb-4 pt-3 text-[15px] leading-relaxed text-zinc-400">{item.a}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
