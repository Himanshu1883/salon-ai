export function StaffAnalyticsOverviewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 rounded-[20px] bg-[#E8ECF4]" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-[20px] bg-[#E8ECF4]" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-56 rounded-[20px] bg-[#E8ECF4]" />
        <div className="h-56 rounded-[20px] bg-[#E8ECF4]" />
      </div>
    </div>
  );
}

export function StaffAnalyticsChartsSkeleton() {
  return (
    <div className="grid gap-4 animate-pulse xl:grid-cols-3">
      <div className="h-72 rounded-[20px] bg-[#E8ECF4] xl:col-span-2" />
      <div className="h-72 rounded-[20px] bg-[#E8ECF4]" />
      <div className="h-64 rounded-[20px] bg-[#E8ECF4]" />
      <div className="h-64 rounded-[20px] bg-[#E8ECF4]" />
    </div>
  );
}

export function StaffAnalyticsDetailsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-64 rounded-[20px] bg-[#E8ECF4] xl:col-span-2" />
        <div className="h-64 rounded-[20px] bg-[#E8ECF4]" />
      </div>
      <div className="h-72 rounded-[20px] bg-[#E8ECF4]" />
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 rounded-[20px] bg-[#E8ECF4]" />
        ))}
      </div>
    </div>
  );
}
