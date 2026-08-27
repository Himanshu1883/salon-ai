import type { Appointment } from "@/components/appointments/types";
import { parseVisitGroupId } from "@/lib/appointments/visit-group";

export function collectVisitGroupAppointments(
  appointment: Appointment,
  allAppointments: Appointment[]
): Appointment[] {
  const groupId = parseVisitGroupId(appointment.notes);
  if (!groupId) return [appointment];

  return allAppointments
    .filter((item) => parseVisitGroupId(item.notes) === groupId)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
}

export function buildCheckInHref(
  appointment: Appointment,
  allAppointments: Appointment[]
): string {
  const visitAppointments = collectVisitGroupAppointments(
    appointment,
    allAppointments
  );
  const params = new URLSearchParams();

  const primary = visitAppointments[0] ?? appointment;
  if (primary.customerId) {
    params.set("customerId", primary.customerId);
  }
  if (primary.customer.name) {
    params.set("name", primary.customer.name);
  }
  if (primary.customer.phone) {
    params.set("phone", primary.customer.phone);
  }

  const serviceIds = [
    ...new Set(
      visitAppointments
        .map((item) => item.serviceId)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  if (serviceIds.length > 0) {
    params.set("serviceIds", serviceIds.join(","));
  }

  const assignedEmployee =
    visitAppointments.find((item) => item.employee?.id)?.employee ??
    appointment.employee;
  if (assignedEmployee?.id) {
    params.set("employeeId", assignedEmployee.id);
  }

  params.set("fromAppointment", appointment.id);

  const query = params.toString();
  return query ? `/check-in?${query}` : "/check-in";
}
