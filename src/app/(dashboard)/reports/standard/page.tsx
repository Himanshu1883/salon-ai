import { getReportsCatalog } from "@/actions/reports";
import { ReportsCatalogClient } from "@/components/reports/reports-catalog-client";
import type { ReportCategory } from "@/lib/reports-catalog";

export default async function StandardReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    createdBy?: string;
  }>;
}) {
  const params = await searchParams;
  const category = (params.category as ReportCategory | "all") ?? "all";
  const search = params.search ?? "";
  const createdBy = params.createdBy ?? "all";

  const reports = await getReportsCatalog({
    category,
    search,
    createdBy,
    view: "standard",
  });

  return (
    <ReportsCatalogClient
      reports={reports}
      filters={{ category, search, createdBy }}
      view="standard"
      title="Standard reports"
      subtitle="All reports included with your plan."
    />
  );
}
