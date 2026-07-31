import { getPaidSales } from "@/actions/sales";
import { SalesListClient } from "@/components/sales/sales-list-client";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;
  const sales = await getPaidSales({
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    search: params.search,
  });

  return (
    <SalesListClient
      sales={sales}
      filters={{
        dateFrom: params.dateFrom ?? "",
        dateTo: params.dateTo ?? "",
        search: params.search ?? "",
      }}
    />
  );
}
