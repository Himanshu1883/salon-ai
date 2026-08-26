export function ServiceMenuSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-1">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="h-8 w-40 rounded-lg bg-[#ECECEC]" />
        <div className="h-10 w-32 rounded-xl bg-[#ECECEC]" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-[#ECECEC] p-4">
            <div className="mb-3 h-5 w-32 rounded bg-[#ECECEC]" />
            <div className="space-y-2">
              <div className="h-12 rounded-xl bg-[#F7F8FC]" />
              <div className="h-12 rounded-xl bg-[#F7F8FC]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
