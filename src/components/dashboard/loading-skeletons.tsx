export function PageHeaderSkeleton({
  titleWidth = "w-48",
  showBadge = false,
}: {
  titleWidth?: string;
  showBadge?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`h-8 ${titleWidth} rounded-lg bg-[#E8ECF4]`} />
        {showBadge && <div className="h-6 w-10 rounded-full bg-[#E8ECF4]" />}
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-24 rounded-xl bg-[#E8ECF4]" />
        <div className="h-9 w-20 rounded-xl bg-[#E8ECF4]" />
      </div>
    </div>
  );
}

export function TablePageLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <PageHeaderSkeleton showBadge />
      <div className="flex flex-wrap gap-3">
        <div className="h-10 w-64 rounded-xl bg-[#E8ECF4]" />
        <div className="h-10 w-32 rounded-xl bg-[#E8ECF4]" />
        <div className="h-10 w-32 rounded-xl bg-[#E8ECF4]" />
      </div>
      <div className="overflow-hidden rounded-[20px] border border-[#E8ECF4] bg-white">
        <div className="border-b border-[#E8ECF4] px-4 py-3">
          <div className="flex gap-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-20 rounded bg-[#E8ECF4]" />
            ))}
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[#E8ECF4]/60 px-4 py-4 last:border-0"
          >
            <div className="h-10 w-10 shrink-0 rounded-full bg-[#E8ECF4]" />
            <div className="h-4 w-32 rounded bg-[#E8ECF4]" />
            <div className="h-4 w-24 rounded bg-[#E8ECF4]" />
            <div className="h-4 w-28 rounded bg-[#E8ECF4]" />
            <div className="ml-auto h-6 w-16 rounded-full bg-[#E8ECF4]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-5 animate-pulse xl:space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[72px] rounded-2xl border border-[#E8ECF4] bg-white"
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 md:gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-[60px] rounded-2xl bg-white shadow-sm sm:h-[64px]" />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-56 rounded-[20px] border border-[#E8ECF4] bg-white" />
        <div className="h-56 rounded-[20px] border border-[#E8ECF4] bg-white" />
        <div className="h-56 rounded-[20px] border border-[#E8ECF4] bg-white md:col-span-2 lg:col-span-1" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-[20px] border border-[#E8ECF4] bg-white"
          />
        ))}
      </div>
    </div>
  );
}

export function QueueLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <PageHeaderSkeleton titleWidth="w-36" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-24 rounded-[20px] bg-[#E8ECF4]" />
        <div className="h-24 rounded-[20px] bg-[#E8ECF4]" />
        <div className="h-24 rounded-[20px] bg-[#E8ECF4]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-[480px] rounded-[20px] border border-[#E8ECF4] bg-white" />
        <div className="h-[480px] rounded-[20px] border border-[#E8ECF4] bg-white" />
      </div>
    </div>
  );
}

export function InventoryLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <PageHeaderSkeleton titleWidth="w-40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-[20px] border border-[#E8ECF4] bg-white"
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-[20px] border border-[#E8ECF4] bg-white" />
        <div className="h-72 rounded-[20px] border border-[#E8ECF4] bg-white" />
      </div>
    </div>
  );
}

export function ChartLoadingSkeleton() {
  return (
    <div className="h-56 min-w-0 animate-pulse rounded-[20px] border border-[#E8ECF4] bg-white" />
  );
}

export function GenericPageLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <PageHeaderSkeleton />
      <div className="h-64 rounded-[20px] border border-[#E8ECF4] bg-white" />
    </div>
  );
}
