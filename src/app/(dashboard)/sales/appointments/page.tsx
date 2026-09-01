import { AppointmentsClient } from "@/app/(dashboard)/appointments/appointments-client";
import { resolveAppointmentsRangeStart } from "@/lib/appointments/page-windows";

export default async function SalesAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    customerId?: string;
    name?: string;
    phone?: string;
    weekStart?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <AppointmentsClient
      weekStartIso={resolveAppointmentsRangeStart(params.weekStart)}
      prefilledCustomer={{
        customerId: params.customerId ?? "",
        name: params.name ?? "",
        phone: params.phone ?? "",
      }}
      autoOpenCreate={Boolean(params.customerId || params.name)}
    />
  );
}
