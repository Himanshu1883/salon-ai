export function CatalogServicesLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse pb-8">
      {/* Header skeleton */}
      <div className="overflow-hidden rounded-[20px] border border-dashboard-border bg-dashboard-card">
        <div className="bg-gradient-to-br from-violet-600/5 via-dashboard-card to-dashboard-card px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="h-20 w-20 shrink-0 rounded-2xl bg-violet-100" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 rounded-xl bg-dashboard-border" />
              <div className="h-4 w-72 max-w-full rounded-lg bg-dashboard-border/70" />
              <div className="flex gap-2">
                <div className="h-6 w-24 rounded-lg bg-violet-100" />
                <div className="h-6 w-20 rounded-lg bg-dashboard-border" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-[20px] border border-dashboard-border bg-dashboard-card"
          />
        ))}
      </div>

      {/* Toolbar skeleton */}
      <div className="flex flex-wrap gap-3">
        <div className="h-11 min-w-[220px] flex-1 max-w-md rounded-2xl bg-dashboard-border/60" />
        <div className="h-11 w-28 rounded-2xl bg-dashboard-border/60" />
        <div className="h-11 w-36 rounded-2xl bg-dashboard-border/60" />
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="h-72 rounded-[20px] border border-dashboard-border bg-dashboard-card" />
        <div className="space-y-6">
          <div className="h-64 rounded-[20px] border border-dashboard-border bg-dashboard-card" />
          <div className="h-48 rounded-[20px] border border-dashboard-border bg-dashboard-card" />
        </div>
      </div>
    </div>
  );
}

export default function CatalogServicesLoading() {
  return <CatalogServicesLoadingSkeleton />;
}
