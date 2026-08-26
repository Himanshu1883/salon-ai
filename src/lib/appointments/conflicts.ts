import { addMinutes } from "date-fns";

/** Appointments in these statuses block the employee's calendar. */
export const BLOCKING_APPOINTMENT_STATUSES = ["scheduled", "checked_in"] as const;

export type AppointmentSlot = {
  employeeId: string | null;
  scheduledAt: Date | string;
  service: { duration: number };
};

export function appointmentsOverlap(
  startA: Date,
  durationA: number,
  startB: Date,
  durationB: number
): boolean {
  const endA = addMinutes(startA, durationA);
  const endB = addMinutes(startB, durationB);
  return startA < endB && endA > startB;
}

export function hasEmployeeConflict(
  employeeId: string,
  scheduledAt: Date,
  duration: number,
  existing: AppointmentSlot[]
): boolean {
  return existing.some((apt) => {
    if (apt.employeeId !== employeeId) return false;
    return appointmentsOverlap(
      scheduledAt,
      duration,
      new Date(apt.scheduledAt),
      apt.service.duration
    );
  });
}

export function getBusyEmployeeIds(
  scheduledAt: Date,
  duration: number,
  employeeIds: string[],
  existing: AppointmentSlot[]
): Set<string> {
  const busy = new Set<string>();
  for (const id of employeeIds) {
    if (hasEmployeeConflict(id, scheduledAt, duration, existing)) {
      busy.add(id);
    }
  }
  return busy;
}
