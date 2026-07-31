import { getFavoriteReportSlugs } from "@/actions/reports";
import { ReportsSidebar } from "@/components/reports/reports-sidebar";

export default async function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const favorites = await getFavoriteReportSlugs();

  return (
    <div className="-m-6 flex min-h-[calc(100vh-4rem)] lg:-m-8">
      <ReportsSidebar favoriteCount={favorites.length} />
      <div className="min-w-0 flex-1 bg-[#F7F8FC]">{children}</div>
    </div>
  );
}
