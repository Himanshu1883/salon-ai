import { getAllSalonsForPage, getAdminStatsForPage } from "@/actions/platform-admin";
import { SalonsListClient } from "./salons-list-client";
import type { SalonPlanFilter, SalonStatusFilter } from "@/actions/platform-admin";

export async function AdminSalonsContent({
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
  const [data, stats] = await Promise.all([
    getAllSalonsForPage({ search, status, plan, page }),
    getAdminStatsForPage(),
  ]);

  return (
    <SalonsListClient
      salons={data.salons}
      total={data.total}
      page={data.page}
      totalPages={data.totalPages}
      search={search}
      status={status}
      plan={plan}
      stats={stats}
      readOnly={readOnly}
    />
  );
}
