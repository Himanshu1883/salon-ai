export type AppointmentServiceStaffSource = {
  id: string;
  serviceId: string;
  employeeId: string | null;
};

/** Match queue services to visit items in order so each line keeps its own staff. */
export function attachAppointmentStaffToQueueServices<
  T extends {
    service: { id: string };
    employeeId?: string | null;
    appointmentServiceItemId?: string;
  },
>(
  services: T[],
  appointmentItems: AppointmentServiceStaffSource[] | undefined,
  fallbackEmployeeId?: string | null
): Array<
  T & {
    employeeId: string | null;
    appointmentServiceItemId?: string;
  }
> {
  const remaining = [...(appointmentItems ?? [])];
  return services.map((qs) => {
    const matchIndex = remaining.findIndex(
      (item) => item.serviceId === qs.service.id
    );
    const match =
      matchIndex >= 0 ? remaining.splice(matchIndex, 1)[0] : undefined;
    return {
      ...qs,
      employeeId: match
        ? match.employeeId
        : (fallbackEmployeeId ?? qs.employeeId ?? null),
      appointmentServiceItemId: match?.id ?? qs.appointmentServiceItemId,
    };
  });
}
