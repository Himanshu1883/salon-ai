"use client";

import { updateAppointmentStatus } from "@/actions/appointments";
import { useRecordSale } from "@/components/dashboard/record-sale-provider";
import {
  appointmentsToInvoicePrefill,
  collectVisitGroupAppointments,
} from "@/lib/appointments/check-in-prefill";
import type { Appointment } from "./types";

export function useAppointmentRecordSale() {
  const { openRecordSale } = useRecordSale();

  function openAppointmentSale(
    appointment: Appointment,
    allAppointments: Appointment[],
    options?: { onOpened?: () => void; onRefresh?: () => void }
  ) {
    const visitAppointments = collectVisitGroupAppointments(
      appointment,
      allAppointments.length > 0 ? allAppointments : [appointment]
    );
    options?.onOpened?.();
    openRecordSale({
      prefill: appointmentsToInvoicePrefill(appointment, allAppointments),
      onSuccess: async () => {
        await Promise.all(
          visitAppointments
            .filter(
              (item) =>
                item.status !== "completed" &&
                item.status !== "cancelled" &&
                item.status !== "no_show"
            )
            .map((item) => updateAppointmentStatus(item.id, "completed"))
        );
        options?.onRefresh?.();
      },
    });
  }

  return { openAppointmentSale };
}
