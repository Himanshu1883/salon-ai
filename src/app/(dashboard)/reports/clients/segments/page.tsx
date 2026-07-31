import { getClientSegmentsSummary } from "@/actions/reports";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportDataTable, ReportStatCards } from "@/components/reports/report-table";

export default async function ClientSegmentsPage() {
  const { segments, totalClients } = await getClientSegmentsSummary();

  return (
    <ReportPageShell
      title="Client segments summary"
      description="Overview of custom client segments."
      showDateFilter={false}
    >
      <ReportStatCards
        stats={[
          { label: "Total clients", value: String(totalClients) },
          { label: "Segments", value: String(segments.length) },
        ]}
      />
      <ReportDataTable
        title="Segments"
        columns={[
          { key: "name", header: "Segment" },
          { key: "desc", header: "Description" },
        ]}
        rows={segments.map((r) => ({
          name: r.name,
          desc: r.description ?? "—",
        }))}
      />
    </ReportPageShell>
  );
}
