import { checkInFromAppointment } from "@/actions/queue";

export type AppointmentCheckInResult = {
  error?: string;
  success?: boolean;
  alreadyInQueue?: boolean;
  alreadyCompleted?: boolean;
  appointmentIds?: string[];
};

type CheckInRequestOptions = {
  startNow?: boolean;
  retry?: boolean;
};

function isSuccess(result: AppointmentCheckInResult) {
  return Boolean(result.success || result.alreadyInQueue || result.alreadyCompleted) && !result.error;
}

function isRetryableCheckInError(error?: string) {
  return (
    !error ||
    error === "Could not check in. Try again." ||
    error === "Unauthorized" ||
    error === "Invalid request" ||
    error === "This appointment is already in the queue."
  );
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
  const data = (await response.json().catch(() => ({}))) as AppointmentCheckInResult;
  if (isSuccess(data)) return { ...data, success: true };
  if (data.error === "This appointment is already in the queue.") {
    return { success: true, alreadyInQueue: true };
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

  const finish = async (result: AppointmentCheckInResult) => {
    if (isSuccess(result)) return { ...result, success: true };
    if (!isRetryableCheckInError(result.error)) return result;
    const verify = await postAppointmentCheckIn(appointmentId, startNow).catch(
      () => ({ error: "Could not check in. Try again." }) as AppointmentCheckInResult
    );
    if (isSuccess(verify)) return { ...verify, success: true };
    return result;
  };

  try {
    const result = await postAppointmentCheckIn(appointmentId, startNow);
    if (isSuccess(result) || options.retry === false) return finish(result);
    if (!result.error || !isRetryableCheckInError(result.error)) return result;

    const retry = await postAppointmentCheckIn(appointmentId, startNow);
    if (isSuccess(retry)) return retry;

    try {
      const action = await checkInFromAppointment(appointmentId, { startNow });
      if (isSuccess(action) || !action.error) {
        return { ...action, success: !action.error };
      }
    } catch {
      /* verify below */
    }

    return finish(retry.error ? retry : result);
  } catch {
    try {
      const action = await checkInFromAppointment(appointmentId, { startNow });
      if (!action.error) return { ...action, success: true };
    } catch {
      /* verify */
    }
    return finish({ error: "Could not check in. Try again." });
  }
}
