/** Hidden from Today's Schedule once the visit has started or finished. */
export const TODAY_SCHEDULE_HIDDEN_STATUSES = new Set([
  "completed",
  "cancelled",
  "no_show",
  "checked_in",
]);

export function getUpcomingTodayAppointments<
  T extends { id: string; scheduledAt: Date | string; status: string },
>(appointments: T[], _now = new Date(), limit = 5) {
  const items = appointments
    .filter(
      (appointment) => !TODAY_SCHEDULE_HIDDEN_STATUSES.has(appointment.status)
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    )
    .slice(0, limit);

  return {
    items,
    nextId: items[0]?.id ?? null,
  };
}
