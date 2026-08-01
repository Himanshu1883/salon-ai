import { CustomerInfoCardSkeleton } from "@/components/check-in/customer-info-card";

export default function CheckInLoading() {
  return (
    <div className="space-y-5 pb-24 sm:space-y-6">
      <div className="animate-pulse overflow-hidden rounded-[20px] border border-dashboard-border bg-dashboard-card shadow-dashboard-card">
        <div className="px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-violet-100" />
            <div className="flex-1 space-y-2">
              <div className="h-8 w-56 rounded-lg bg-violet-100" />
              <div className="h-4 w-72 max-w-full rounded bg-violet-50" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <CustomerInfoCardSkeleton />
          <div className="animate-pulse rounded-[20px] border border-dashboard-border bg-dashboard-card p-6 shadow-dashboard-card">
            <div className="mb-5 h-6 w-40 rounded bg-violet-100" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-violet-50" />
              ))}
            </div>
          </div>
        </div>
        <div className="animate-pulse rounded-[20px] border border-dashboard-border bg-dashboard-card p-6 shadow-dashboard-card">
          <div className="mb-4 h-6 w-32 rounded bg-violet-100" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-violet-50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
