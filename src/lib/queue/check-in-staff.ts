export function parseCheckInStaffAssignments(
  formData: FormData,
  serviceIds: string[],
  fallbackEmployeeId?: string
): Record<string, string> {
  const assignments: Record<string, string> = {};
  for (const serviceId of serviceIds) {
    const raw = formData.get(`staff_${serviceId}`);
    const staffId = typeof raw === "string" ? raw.trim() : "";
    if (staffId) {
      assignments[serviceId] = staffId;
    } else if (fallbackEmployeeId) {
      assignments[serviceId] = fallbackEmployeeId;
    }
  }
  return assignments;
}

export function primaryCheckInEmployeeId(
  assignments: Record<string, string>,
  fallbackEmployeeId?: string
): string | undefined {
  return (
    Object.values(assignments).find(Boolean) || fallbackEmployeeId || undefined
  );
}

export function queueServiceCreates(
  serviceIds: string[],
  assignments: Record<string, string>,
  allowedStaffIds: Set<string>
): { serviceId: string; employeeId?: string }[] {
  return serviceIds.map((serviceId) => {
    const staffId = assignments[serviceId];
    return {
      serviceId,
      ...(staffId && allowedStaffIds.has(staffId)
        ? { employeeId: staffId }
        : {}),
    };
  });
}

export function queueServiceCreatesFromAppointmentLines(
  serviceIds: string[],
  lines: { serviceId: string; employeeId: string | null }[]
): { serviceId: string; employeeId?: string }[] {
  const remaining = [...lines];
  return serviceIds.map((serviceId) => {
    const matchIndex = remaining.findIndex((item) => item.serviceId === serviceId);
    const match = matchIndex >= 0 ? remaining.splice(matchIndex, 1)[0] : undefined;
    return {
      serviceId,
      ...(match?.employeeId ? { employeeId: match.employeeId } : {}),
    };
  });
}

export function parseStaffQuery(raw?: string): Record<string, string> {
  if (!raw?.trim()) return {};
  const assignments: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const separator = pair.indexOf(":");
    if (separator <= 0) continue;
    const serviceId = pair.slice(0, separator).trim();
    const employeeId = pair.slice(separator + 1).trim();
    if (serviceId && employeeId) assignments[serviceId] = employeeId;
  }
  return assignments;
}
