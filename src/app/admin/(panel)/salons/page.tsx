import { getAllSalons, type SalonStatusFilter } from "@/actions/platform-admin";
import { SalonsListClient } from "./salons-list-client";

export default async function AdminSalonsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const status = (params.status ?? "all") as SalonStatusFilter;
  const page = params.page ? Number.parseInt(params.page, 10) : 1;

  const data = await getAllSalons({
    search: params.search,
    status,
    page: Number.isNaN(page) ? 1 : page,
  });

  return (
    <SalonsListClient
      salons={data.salons}
      total={data.total}
      page={data.page}
      totalPages={data.totalPages}
      search={params.search ?? ""}
      status={status}
    />
  );
}
