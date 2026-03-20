"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const COLLAPSE_LEN = 520;

type ProductDescriptionExpandableProps = {
  text: string;
};

export function ProductDescriptionExpandable({ text }: ProductDescriptionExpandableProps) {
  const needsToggle = useMemo(() => text.trim().length > COLLAPSE_LEN, [text]);
  const [open, setOpen] = useState(false);

  const preview = useMemo(() => {
    if (!needsToggle || open) {
      return text.trim();
    }
    const slice = text.trim().slice(0, COLLAPSE_LEN);
    const lastSpace = slice.lastIndexOf(" ");
    return `${slice.slice(0, lastSpace > 240 ? lastSpace : COLLAPSE_LEN).trimEnd()}…`;
  }, [needsToggle, open, text]);

  if (!text.trim()) {
    return null;
  }

  return (
    <section>
      <h2 className="font-display text-xl font-normal text-white sm:text-2xl">Опис</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        Деталі комплектації та сумісності уточнюйте у менеджера перед оплатою.
      </p>

      <div className="relative mt-6">
        <motion.div
          className="ui-prose-pdp whitespace-pre-wrap"
          layout
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {open ? text.trim() : preview}
        </motion.div>
        <AnimatePresence initial={false}>
          {needsToggle && !open ? (
            <motion.div
              key="fade"
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface-950 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          ) : null}
        </AnimatePresence>
      </div>
      {needsToggle ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-brand-500/25 bg-brand-500/10 px-4 py-2.5 text-sm font-medium text-brand-100 transition hover:border-brand-400/50 hover:bg-brand-500/15"
        >
          {open ? "Згорнути" : "Читати повністю"}
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}>
            <ChevronDown className="h-4 w-4" strokeWidth={2} />
          </motion.span>
        </button>
      ) : null}
    </section>
  );
}
