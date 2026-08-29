export type AppointmentCheckInResult = {
  error?: string;
  success?: boolean;
  alreadyInQueue?: boolean;
  alreadyCompleted?: boolean;
  appointmentIds?: string[];
};

type CheckInRequestOptions = {
  startNow?: boolean;
};

/** Real booking problems — restore the row. Transient/network errors must not. */
export function isCheckInBusinessFailure(error?: string) {
  if (!error) return false;
  return (
    error === "Appointment not found" ||
    error.startsWith("Cannot check in") ||
    error === "Appointment is already completed" ||
    error.includes("missing from the catalog") ||
    error.includes("linked service or staff")
  );
}

function isAlreadyInQueue(result: AppointmentCheckInResult) {
  return (
    result.alreadyInQueue === true ||
    result.error === "This appointment is already in the queue."
  );
}

function isSuccess(result: AppointmentCheckInResult) {
  if (isAlreadyInQueue(result) || result.alreadyCompleted) return true;
  return Boolean(result.success && !result.error);
}

async function postAppointmentCheckIn(
  appointmentId: string,
  startNow: boolean
): Promise<AppointmentCheckInResult> {
  const response = await fetch("/api/appointments/check-in", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appointmentId, startNow }),
  });
  const data = (await response
    .json()
    .catch(() => ({}))) as AppointmentCheckInResult;
  if (isSuccess(data)) {
    return { ...data, success: true, error: undefined };
  }
  if (data.error) return data;
  if (!response.ok) {
    return { error: "Could not check in. Try again." };
  }
  return { ...data, success: true };
}

export async function requestAppointmentCheckIn(
  appointmentId: string,
  options: CheckInRequestOptions = {}
): Promise<AppointmentCheckInResult> {
  const startNow = options.startNow === true;
  try {
    const result = await postAppointmentCheckIn(appointmentId, startNow);
    if (isSuccess(result)) return { ...result, success: true, error: undefined };
    if (isCheckInBusinessFailure(result.error)) return result;

    const retry = await postAppointmentCheckIn(appointmentId, startNow);
    if (isSuccess(retry)) return { ...retry, success: true, error: undefined };
    return retry;
  } catch {
    try {
      const verify = await postAppointmentCheckIn(appointmentId, startNow);
      if (isSuccess(verify)) {
        return { ...verify, success: true, error: undefined };
      }
      return verify;
    } catch {
      return { error: "Could not check in. Try again." };
    }
  }
}
