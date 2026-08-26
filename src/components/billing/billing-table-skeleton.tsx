export function BillingTableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-5">
      <div className="h-4 w-48 rounded bg-[#ECECEC]" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-14 rounded-xl bg-[#F7F8FC]" />
        ))}
      </div>
    </div>
  );
}
