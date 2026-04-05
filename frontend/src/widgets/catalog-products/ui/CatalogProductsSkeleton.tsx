export const CatalogProductsSkeleton = () => {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-border" />
        <div className="h-5 w-96 animate-pulse rounded-md bg-border" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`catalog-skeleton-${index}`}
            className="overflow-hidden rounded-2xl border border-border bg-white"
          >
            <div className="h-56 animate-pulse bg-border" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-32 animate-pulse rounded bg-border" />
              <div className="h-6 w-full animate-pulse rounded bg-border" />
              <div className="h-5 w-5/6 animate-pulse rounded bg-border" />
              <div className="flex items-center justify-between gap-3">
                <div className="h-7 w-28 animate-pulse rounded bg-border" />
                <div className="h-6 w-32 animate-pulse rounded-full bg-border" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
