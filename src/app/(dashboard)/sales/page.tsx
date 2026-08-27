import { SalesPageContent } from "./sales-page-content";

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

  return (
    <SalesPageContent
      filters={{
        dateFrom: params.dateFrom ?? "",
        dateTo: params.dateTo ?? "",
        search: params.search ?? "",
      }}
    />
  );
}
