export const PopularProductsSkeleton = () => {
  return (
    <section className="space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-7 w-36 rounded-full bg-border/70" />
        <div className="h-10 w-80 max-w-full rounded-xl bg-border/70" />
        <div className="h-5 w-72 max-w-full rounded-xl bg-border/60" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <article key={index} className="overflow-hidden rounded-2xl border border-border bg-white">
            <div className="relative h-64 bg-white">
              <div className="h-full w-full bg-border/40" />
              <div className="absolute bottom-4 left-4 h-8 w-14 rounded-sm bg-border/70" />
            </div>

            <div className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-24 rounded bg-border/60" />
                <div className="h-5 w-20 rounded bg-border/60" />
                <div className="h-5 w-12 rounded bg-border/60" />
              </div>

              <div className="h-10 w-11/12 rounded bg-border/70" />
              <div className="h-10 w-2/3 rounded bg-border/60" />

              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="h-11 w-28 rounded bg-border/70" />
                <div className="h-12 w-32 rounded bg-border/70" />
              </div>

              <div className="h-8 w-32 rounded bg-border/60" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
