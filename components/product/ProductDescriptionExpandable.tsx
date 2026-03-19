"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const COLLAPSE_LEN = 380;

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
    return `${slice.slice(0, lastSpace > 200 ? lastSpace : COLLAPSE_LEN).trimEnd()}…`;
  }, [needsToggle, open, text]);

  if (!text.trim()) {
    return null;
  }

  return (
    <div className="mt-8 border-t border-brand-500/10 pt-8">
      <h2 className="font-display text-xl font-normal text-white">Опис</h2>
      <div className="relative mt-4">
        <motion.p
          className="ui-body whitespace-pre-wrap text-[15px] leading-relaxed"
          layout
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {open ? text.trim() : preview}
        </motion.p>
        <AnimatePresence initial={false}>
          {needsToggle && !open ? (
            <motion.div
              key="fade"
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface-900 to-transparent"
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
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-brand-500/20 px-3 py-2 text-sm font-medium text-brand-200 transition hover:border-brand-400/45 hover:bg-brand-500/10 hover:text-brand-100"
        >
          {open ? "Згорнути" : "Читати повністю"}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.22 }}
          >
            <ChevronDown className="h-4 w-4" strokeWidth={2} />
          </motion.span>
        </button>
      ) : null}
    </div>
  );
}
