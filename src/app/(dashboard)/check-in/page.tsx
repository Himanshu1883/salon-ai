import { requireSession } from "@/lib/auth";
import { getCheckInOverview } from "@/actions/queue-overview";
import { parseStaffQuery } from "@/lib/queue/check-in-staff";
import { CheckInClient } from "./check-in-client";

export default async function CheckInPage({
  searchParams,
}: {
  searchParams: Promise<{
    customerId?: string;
    name?: string;
    phone?: string;
    serviceIds?: string;
    employeeId?: string;
    staff?: string;
    fromAppointment?: string;
  }>;
}) {
  await requireSession();
  const params = await searchParams;
  const serviceIds = params.serviceIds
    ? params.serviceIds.split(",").map((id) => id.trim()).filter(Boolean)
    : [];

  const overview = await getCheckInOverview();

  return (
    <CheckInClient
      overview={overview}
      prefilledCustomer={{
        customerId: params.customerId ?? "",
        name: params.name ?? "",
        phone: params.phone ?? "",
        serviceIds,
        employeeId: params.employeeId ?? "",
        staffByService: parseStaffQuery(params.staff),
        fromAppointmentId: params.fromAppointment ?? "",
      }}
    />
  );
}
