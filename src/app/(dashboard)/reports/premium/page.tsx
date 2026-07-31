import { getReportsCatalog } from "@/actions/reports";
import { ReportsCatalogClient } from "@/components/reports/reports-catalog-client";
import type { ReportCategory } from "@/lib/reports-catalog";

export default async function PremiumReportsPage({
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
    view: "premium",
  });

  return (
    <ReportsCatalogClient
      reports={reports}
      filters={{ category, search, createdBy }}
      view="premium"
      title="Premium reports"
      subtitle="Advanced analytics and time-period breakdowns."
    />
  );
}
