import { getReportsCatalog } from "@/actions/reports";
import { ReportsCatalogClient } from "@/components/reports/reports-catalog-client";
import type { ReportCategory } from "@/lib/reports-catalog";

export default async function FavouritesPage({
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
    view: "favourites",
  });

  return (
    <ReportsCatalogClient
      reports={reports}
      filters={{ category, search, createdBy }}
      view="favourites"
      title="Favourites"
      subtitle="Reports you've starred for quick access."
      emptyMessage="No favourite reports yet. Star a report to add it here."
    />
  );
}
