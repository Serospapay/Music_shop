"use client";

import { Minus, Plus } from "lucide-react";

type ProductQuantityStepperProps = {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  max?: number;
};

export function ProductQuantityStepper({
  value,
  onChange,
  disabled = false,
  max = 99,
}: ProductQuantityStepperProps) {
  const dec = () => {
    if (disabled) {
      return;
    }
    onChange(Math.max(1, value - 1));
  };

  const inc = () => {
    if (disabled) {
      return;
    }
    onChange(Math.min(max, value + 1));
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-zinc-400">Кількість</span>
      <div className="inline-flex items-center rounded-xl border border-brand-500/20 bg-surface-900/95 p-1">
        <button
          type="button"
          onClick={dec}
          disabled={disabled || value <= 1}
          className="ui-stepper-btn disabled:opacity-40"
          aria-label="Зменшити кількість"
        >
          <Minus className="h-4 w-4" strokeWidth={2} />
        </button>
        <span className="min-w-[2.25rem] text-center text-sm font-semibold tabular-nums text-white">{value}</span>
        <button
          type="button"
          onClick={inc}
          disabled={disabled || value >= max}
          className="ui-stepper-btn disabled:opacity-40"
          aria-label="Збільшити кількість"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
