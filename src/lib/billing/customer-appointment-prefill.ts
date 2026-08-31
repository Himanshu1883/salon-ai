import {
  appointmentsToInvoicePrefill,
  collectVisitGroupAppointments,
} from "@/lib/appointments/check-in-prefill";
import { parseVisitGroupId } from "@/lib/appointments/visit-group";
import type { Appointment } from "@/components/appointments/types";
import type { InvoicePrefill } from "@/components/billing/types";

const CLOSED_STATUSES = new Set(["cancelled", "no_show"]);
const SKIP_ITEM_STATUSES = new Set(["cancelled", "no_show"]);

export type OpenVisitCandidate = {
  id: string;
  status: string;
  scheduledAt: Date | string;
  notes: string | null;
  hasInvoice: boolean;
  /** Present when the visit stores AppointmentServiceItem rows. */
  hasStoredItems?: boolean;
  billableItemCount?: number;
};

function statusRank(status: string) {
  if (status === "in_progress") return 0;
  if (status === "checked_in") return 1;
  if (status === "scheduled") return 2;
  return 3;
}

export function pickOpenVisitForInvoice(
  visits: OpenVisitCandidate[],
  now = new Date()
): string | null {
  const invoicedGroups = new Set(
    visits
      .filter((visit) => visit.hasInvoice)
      .map((visit) => parseVisitGroupId(visit.notes))
      .filter((id): id is string => Boolean(id))
  );

  const open = visits.filter((visit) => {
    if (CLOSED_STATUSES.has(visit.status) || visit.hasInvoice) return false;
    if (visit.hasStoredItems && (visit.billableItemCount ?? 0) === 0) {
      return false;
    }
    const groupId = parseVisitGroupId(visit.notes);
    if (groupId && invoicedGroups.has(groupId)) return false;
    return true;
  });

  if (open.length === 0) return null;

  const nowMs = now.getTime();
  const sorted = [...open].sort((a, b) => {
    const rank = statusRank(a.status) - statusRank(b.status);
    if (rank !== 0) return rank;
    const aTime = new Date(a.scheduledAt).getTime();
    const bTime = new Date(b.scheduledAt).getTime();
    const aUpcoming = aTime >= nowMs;
    const bUpcoming = bTime >= nowMs;
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
    return Math.abs(aTime - nowMs) - Math.abs(bTime - nowMs);
  });

  return sorted[0]?.id ?? null;
}

export function invoicePrefillFromCustomerAppointments(
  primary: Appointment,
  allAppointments: Appointment[] = []
): InvoicePrefill | null {
  const visit = collectVisitGroupAppointments(primary, allAppointments);
  const prefill = appointmentsToInvoicePrefill(primary, visit);
  const lineItems = (prefill.lineItems ?? []).filter((item) => {
    const source = visit
      .flatMap((row) => row.serviceItems ?? [])
      .find((row) => row.id === item.appointmentServiceItemId);
    if (!source) return true;
    return !SKIP_ITEM_STATUSES.has(source.status);
  });

  if (lineItems.length === 0) return null;

  return {
    ...prefill,
    lineItems,
  };
}
