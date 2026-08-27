import type { SalonPlanFilter, SalonStatusFilter } from "@/actions/platform-admin";
import { getAdminPageContext } from "@/lib/admin-page-context";
import { AdminSalonsSection } from "./salons-section";

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
  const { superAdmin } = await getAdminPageContext();
  const params = await searchParams;
  const status = (params.status ?? "all") as SalonStatusFilter;
  const plan = (params.plan ?? "all") as SalonPlanFilter;
  const page = params.page ? Number.parseInt(params.page, 10) : 1;

  return (
    <AdminSalonsSection
      search={params.search ?? ""}
      status={status}
      plan={plan}
      page={Number.isNaN(page) ? 1 : page}
      readOnly={!superAdmin}
    />
  );
}
