import {
  getAdminStats,
  getAllSalons,
  type SalonPlanFilter,
  type SalonStatusFilter,
} from "@/actions/platform-admin";
import { SalonsListClient } from "./salons-list-client";
import { auth } from "@/lib/auth";
import { isSuperAdminRole, resolvePlatformRole } from "@/lib/platform-permissions";

export default async function AdminSalonsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    plan?: string;
    page?: string;
  }>;
}) {
  const session = await auth();
  const platformRole = resolvePlatformRole(session?.user ?? {});
  const readOnly = !isSuperAdminRole({
    platformRole,
    isSuperAdmin: session?.user?.isSuperAdmin,
  });

  const params = await searchParams;
  const status = (params.status ?? "all") as SalonStatusFilter;
  const plan = (params.plan ?? "all") as SalonPlanFilter;
  const page = params.page ? Number.parseInt(params.page, 10) : 1;

  const [data, stats] = await Promise.all([
    getAllSalons({
      search: params.search,
      status,
      plan,
      page: Number.isNaN(page) ? 1 : page,
    }),
    getAdminStats(),
  ]);

  return (
    <SalonsListClient
      salons={data.salons}
      total={data.total}
      page={data.page}
      totalPages={data.totalPages}
      search={params.search ?? ""}
      status={status}
      plan={plan}
      stats={stats}
      readOnly={readOnly}
    />
  );
}
