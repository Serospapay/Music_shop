import Link from "next/link";

function pluralPositions(n: number) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m100 >= 11 && m100 <= 14) {
    return "позицій";
  }
  if (m10 === 1) {
    return "позиція";
  }
  if (m10 >= 2 && m10 <= 4) {
    return "позиції";
  }
  return "позицій";
}

function categoryGenitive(n: number) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m100 >= 11 && m100 <= 14) {
    return "категорій";
  }
  if (m10 === 1) {
    return "категорія";
  }
  if (m10 >= 2 && m10 <= 4) {
    return "категорії";
  }
  return "категорій";
}

type HomeIntroProps = {
  productCount: number;
  categoryCount: number;
  categories: string[];
};

export function HomeIntro({ productCount, categoryCount, categories }: HomeIntroProps) {
  const preview = categories.slice(0, 5);
  const rest = Math.max(0, categoryCount - preview.length);

  return (
    <section className="grid gap-8 rounded-2xl border border-brand-500/15 bg-surface-850/60 p-6 shadow-card backdrop-blur-sm sm:grid-cols-[1fr,auto] sm:items-end sm:gap-10 sm:p-8 lg:p-10">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-brand-400/90">Октава</p>
        <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-white sm:text-4xl lg:text-[2.75rem]">
          Музичні інструменти та обладнання з цінами в каталозі
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          Робочий каталог: кожна картка веде на сторінку товару з описом і ціною в гривнях. Замовлення — формою на сайті;
          далі менеджер підтверджує доставку та оплату за домовленістю.
        </p>
        <ul className="mt-5 space-y-2 text-sm text-zinc-400">
          <li className="flex flex-wrap gap-x-1 gap-y-1">
            <span className="text-brand-500/50">—</span>
            <span>
              У каталозі{" "}
              <strong className="font-medium text-brand-100">
                {productCount} {pluralPositions(productCount)}
              </strong>
              .
            </span>
          </li>
          {categoryCount > 0 ? (
            <li className="flex flex-wrap gap-x-1 gap-y-1">
              <span className="text-brand-500/50">—</span>
              <span>
                Фільтр на сторінці каталогу —{" "}
                <strong className="font-medium text-brand-100">{categoryCount}</strong> {categoryGenitive(categoryCount)}.
              </span>
            </li>
          ) : null}
          {preview.length > 0 ? (
            <li className="flex flex-wrap gap-x-2 gap-y-1">
              <span className="text-brand-500/50">—</span>
              <span className="text-zinc-500">Категорії:</span>
              {preview.map((c) => (
                <Link
                  key={c}
                  href={`/catalog?category=${encodeURIComponent(c)}`}
                  className="text-accent-400 underline decoration-accent-500/25 underline-offset-4 transition hover:decoration-accent-400/60"
                >
                  {c}
                </Link>
              ))}
              {rest > 0 ? <span className="text-zinc-500">+ ще {rest}</span> : null}
            </li>
          ) : null}
        </ul>
      </div>
      <div className="flex flex-col gap-3 sm:items-end">
        <Link
          href="/catalog"
          className="inline-flex w-full items-center justify-center rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-surface-950 shadow-brand-sm transition hover:bg-brand-400 sm:w-auto"
        >
          Відкрити каталог
        </Link>
        <Link
          href="/checkout"
          className="inline-flex w-full items-center justify-center rounded-xl border border-accent-500/35 px-6 py-3 text-sm font-semibold text-accent-200 transition hover:border-accent-400/55 hover:bg-accent-500/10 sm:w-auto"
        >
          Кошик і оформлення
        </Link>
      </div>
    </section>
  );
}
