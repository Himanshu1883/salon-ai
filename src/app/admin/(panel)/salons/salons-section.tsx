import { Suspense } from "react";
import { AdminSalonsContent } from "./salons-content";
import type { SalonPlanFilter, SalonStatusFilter } from "@/actions/platform-admin";

function SalonsSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-10 rounded-xl bg-stone-100" />
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-16 rounded-xl bg-stone-50" />
      ))}
    </div>
  );
}

export function AdminSalonsSection({
  search,
  status,
  plan,
  page,
  readOnly,
}: {
  search: string;
  status: SalonStatusFilter;
  plan: SalonPlanFilter;
  page: number;
  readOnly: boolean;
}) {
  return (
    <Suspense fallback={<SalonsSkeleton />}>
      <AdminSalonsContent
        search={search}
        status={status}
        plan={plan}
        page={page}
        readOnly={readOnly}
      />
    </Suspense>
  );
}
