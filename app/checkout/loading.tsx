export default function CheckoutLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-800" />
        <div className="h-10 w-80 animate-pulse rounded bg-surface-800" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,360px]">
        <section className="ui-surface-muted p-6 sm:p-8">
          <div className="space-y-4">
            <div className="h-6 w-52 animate-pulse rounded bg-surface-800" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-surface-800" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-surface-800" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-surface-800" />
            <div className="h-28 w-full animate-pulse rounded-xl bg-surface-800" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-surface-800" />
          </div>
        </section>

        <aside className="ui-surface-muted p-5">
          <div className="space-y-3">
            <div className="h-5 w-32 animate-pulse rounded bg-surface-800" />
            <div className="h-16 w-full animate-pulse rounded-xl bg-surface-800" />
            <div className="h-16 w-full animate-pulse rounded-xl bg-surface-800" />
            <div className="h-10 w-full animate-pulse rounded bg-surface-800" />
          </div>
        </aside>
      </div>
    </div>
  );
}
