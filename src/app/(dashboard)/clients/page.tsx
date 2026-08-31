import { getCustomers, type CustomerSort } from "@/actions/customers";
import { PermissionDeniedError } from "@/lib/permissions/require";
import { PermissionDeniedScreen } from "@/components/permissions/permission-denied-screen";
import { ClientsListClient } from "./clients-list-client";

const VALID_SORTS: CustomerSort[] = [
  "createdAt_desc",
  "createdAt_asc",
  "name_asc",
  "name_desc",
];

function parseSort(value?: string): CustomerSort {
  if (value && VALID_SORTS.includes(value as CustomerSort)) {
    return value as CustomerSort;
  }
  return "createdAt_desc";
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  try {
    const { customers, totalCount, pageSize } = await getCustomers({
      search: params.search,
      sort: parseSort(params.sort),
      page,
      pageSize: 50,
    });

    return (
      <ClientsListClient
        customers={customers}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        search={params.search ?? ""}
        sort={parseSort(params.sort)}
      />
    );
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return <PermissionDeniedScreen featureName="Customers" />;
    }
    throw error;
  }
}
