"use client";

import { motion } from "framer-motion";
import type { ProductSpecRow } from "@/lib/product-specs";

type ProductSpecsPanelProps = {
  rows: ProductSpecRow[];
};

export function ProductSpecsPanel({ rows }: ProductSpecsPanelProps) {
  if (!rows.length) {
    return null;
  }

  return (
    <section className="border-t border-brand-500/10 pt-10">
      <h2 className="font-display text-xl font-normal text-white sm:text-2xl">Характеристики</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        Параметри можуть злегка відрізнятися залежно від партії — уточнення перед відправкою.
      </p>
      <dl className="mt-8 space-y-0 divide-y divide-brand-500/10">
        {rows.map((row, idx) => (
          <motion.div
            key={`${row.label}-${idx}`}
            initial={{ opacity: 0, y: 4 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.22, delay: idx * 0.02 }}
            className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[11rem,1fr] sm:gap-8 sm:py-4"
          >
            <dt className="text-sm font-medium text-zinc-500">{row.label}</dt>
            <dd className="text-[15px] leading-relaxed text-zinc-200">{row.value}</dd>
          </motion.div>
        ))}
      </dl>
    </section>
  );
}
