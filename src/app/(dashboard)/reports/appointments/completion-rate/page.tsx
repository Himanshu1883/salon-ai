import { getCompletionRate } from "@/actions/reports";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportStatCards } from "@/components/reports/report-table";

export default async function CompletionRatePage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const data = await getCompletionRate(params.dateFrom, params.dateTo);

  return (
    <ReportPageShell
      title="Completion rate"
      description="Percentage of appointments completed vs scheduled."
      dateFrom={params.dateFrom}
      dateTo={params.dateTo}
    >
      <ReportStatCards
        stats={[
          { label: "Completion rate", value: `${data.rate}%` },
          { label: "Total (excl. cancelled)", value: String(data.total) },
          { label: "Completed", value: String(data.completed) },
          { label: "No-shows", value: String(data.noShow) },
          { label: "Still scheduled", value: String(data.scheduled) },
        ]}
      />
    </ReportPageShell>
  );
}
