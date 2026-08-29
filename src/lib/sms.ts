import { formatAppointmentDateTime } from "@/lib/appointments/datetime";

export function isTwilioConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
}

export async function sendSms(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string; demoMode: boolean }> {
  if (!isTwilioConfigured()) {
    console.log("[SMS Demo Mode]", { to, message });
    return { success: true, demoMode: true };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_PHONE_NUMBER!;

  try {
    const body = new URLSearchParams({ To: to, From: from, Body: message });
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("[SMS Twilio Error]", err);
      return { success: false, error: err, demoMode: false };
    }

    return { success: true, demoMode: false };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[SMS Error]", msg);
    return { success: false, error: msg, demoMode: false };
  }
}

export function buildAppointmentReminderMessage(
  customerName: string,
  serviceName: string,
  scheduledAt: Date,
  salonName: string
): string {
  const dateStr = formatAppointmentDateTime(
    scheduledAt,
    "EEE, MMM d, h:mm a"
  );
  return `Hi ${customerName}! Reminder: your ${serviceName} appointment at ${salonName} is on ${dateStr}. Reply STOP to opt out.`;
}
