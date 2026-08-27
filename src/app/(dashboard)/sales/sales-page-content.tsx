import { Suspense } from "react";
import { getPaidSales } from "@/actions/sales";
import { SalesListClient } from "@/components/sales/sales-list-client";

async function SalesList({
  filters,
}: {
  filters: { dateFrom: string; dateTo: string; search: string };
}) {
  const sales = await getPaidSales({
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    search: filters.search || undefined,
  });

  return <SalesListClient sales={sales} filters={filters} />;
}

function SalesListSkeleton() {
  return (
    <div className="space-y-6 pb-8 animate-pulse">
      <div className="h-10 w-48 rounded-xl bg-[#E8ECF4]" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-[#E8ECF4]" />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-[#E8ECF4]" />
    </div>
  );
}

export function SalesPageContent({
  filters,
}: {
  filters: { dateFrom: string; dateTo: string; search: string };
}) {
  return (
    <Suspense fallback={<SalesListSkeleton />}>
      <SalesList filters={filters} />
    </Suspense>
  );
}
