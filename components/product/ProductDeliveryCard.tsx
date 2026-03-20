"use client";

import { MapPin, Package } from "lucide-react";

export function ProductDeliveryCard() {
  return (
    <aside className="rounded-2xl border border-brand-500/15 bg-surface-900/50 p-6 sm:p-7">
      <h2 className="font-display text-xl font-normal text-white">Доставка та самовивіз</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        Спосіб і термін узгоджуємо після підтвердження замовлення.
      </p>

      <div className="mt-8 space-y-8">
        <div className="flex gap-4">
          <Package className="mt-0.5 h-6 w-6 shrink-0 text-accent-400/90" strokeWidth={1.75} aria-hidden />
          <div>
            <h3 className="text-base font-semibold text-white">Упаковка та відправка</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">
              Інструменти пакуємо в захисні матеріали; для гітар і клавіш — жорсткі кейси за наявності комплектації.
            </p>
          </div>
        </div>
        <div className="h-px bg-brand-500/10" aria-hidden />
        <div className="flex gap-4">
          <MapPin className="mt-0.5 h-6 w-6 shrink-0 text-brand-400/90" strokeWidth={1.75} aria-hidden />
          <div>
            <h3 className="text-base font-semibold text-white">Самовивіз</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">
              За домовленістю у шоурумі. Години та адресу повідомить менеджер після заявки.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
