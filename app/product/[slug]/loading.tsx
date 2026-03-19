export default function ProductLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-6 flex flex-wrap gap-2">
        <div className="h-4 w-14 animate-pulse rounded bg-surface-800" />
        <div className="h-4 w-4 animate-pulse rounded bg-surface-800" />
        <div className="h-4 w-16 animate-pulse rounded bg-surface-800" />
        <div className="h-4 w-4 animate-pulse rounded bg-surface-800" />
        <div className="h-4 w-24 animate-pulse rounded bg-surface-800" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="ui-frame aspect-square w-full max-w-2xl overflow-hidden lg:col-span-7 lg:max-w-none">
          <div className="h-full w-full animate-pulse bg-surface-800" />
        </div>

        <section className="ui-surface-muted flex flex-col gap-4 p-6 sm:p-8 lg:col-span-5">
          <div className="h-3 w-28 animate-pulse rounded bg-surface-800" />
          <div className="h-10 w-full max-w-md animate-pulse rounded bg-surface-800" />
          <div className="h-9 w-40 animate-pulse rounded bg-surface-800" />
          <div className="h-8 w-48 animate-pulse rounded-full bg-surface-800" />
          <div className="h-14 w-full animate-pulse rounded-xl bg-surface-800" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-surface-800" />
        </section>
      </div>

      <div className="mt-12 space-y-3 border-t border-brand-500/10 pt-10">
        <div className="h-6 w-32 animate-pulse rounded bg-surface-800" />
        <div className="h-4 w-full animate-pulse rounded bg-surface-800" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-surface-800" />
      </div>
    </div>
  );
}
