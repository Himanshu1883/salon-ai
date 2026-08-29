export type AppointmentCheckInResult = {
  error?: string;
  success?: boolean;
  appointmentIds?: string[];
};

type CheckInRequestOptions = {
  startNow?: boolean;
  retry?: boolean;
};

async function postAppointmentCheckIn(
  appointmentId: string,
  startNow: boolean
): Promise<AppointmentCheckInResult> {
  const response = await fetch("/api/appointments/check-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appointmentId, startNow }),
  });
  const data = (await response.json().catch(() => ({}))) as AppointmentCheckInResult;
  if (data.error) return data;
  if (!response.ok) {
    return { error: "Could not check in. Try again." };
  }
  return data;
}

export async function requestAppointmentCheckIn(
  appointmentId: string,
  options: CheckInRequestOptions = {}
): Promise<AppointmentCheckInResult> {
  const startNow = options.startNow === true;
  try {
    const result = await postAppointmentCheckIn(appointmentId, startNow);
    if (result.error && options.retry !== false) {
      return postAppointmentCheckIn(appointmentId, startNow);
    }
    return result;
  } catch {
    if (options.retry !== false) {
      try {
        return await postAppointmentCheckIn(appointmentId, startNow);
      } catch {
        return { error: "Could not check in. Try again." };
      }
    }
    return { error: "Could not check in. Try again." };
  }
}
