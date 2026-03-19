export default function CatalogLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-28 animate-pulse rounded bg-surface-800" />
        <div className="h-10 w-72 animate-pulse rounded bg-surface-800" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-surface-800" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px,1fr] lg:gap-8">
        <aside className="ui-surface-muted p-5">
          <div className="space-y-4">
            <div className="h-5 w-20 animate-pulse rounded bg-surface-800" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-surface-800" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-surface-800" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-surface-800" />
          </div>
        </aside>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`catalog-skeleton-${index}`}
              className="ui-frame overflow-hidden"
            >
              <div className="aspect-[4/3] animate-pulse bg-surface-800" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-20 animate-pulse rounded bg-surface-800" />
                <div className="h-5 w-full animate-pulse rounded bg-surface-800" />
                <div className="h-4 w-full animate-pulse rounded bg-surface-800" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-surface-800" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
