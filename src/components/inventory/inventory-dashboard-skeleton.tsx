export function InventoryDashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 rounded-2xl bg-[#F7F8FC]" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-2xl bg-[#F7F8FC]" />
        <div className="h-72 rounded-2xl bg-[#F7F8FC]" />
      </div>
    </div>
  );
}
