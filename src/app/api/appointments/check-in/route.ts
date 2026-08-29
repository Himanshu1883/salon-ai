import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { performCheckInFromAppointment } from "@/lib/queue/check-in-from-appointment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user?.salonId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let appointmentId = "";
  let startNow = false;
  try {
    const body = (await request.json()) as {
      appointmentId?: unknown;
      startNow?: unknown;
    };
    appointmentId =
      typeof body.appointmentId === "string" ? body.appointmentId.trim() : "";
    startNow = body.startNow === true;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!appointmentId) {
    return NextResponse.json({ error: "Appointment is required" }, { status: 400 });
  }

  const result = await performCheckInFromAppointment({
    salonId: session.user.salonId,
    appointmentId,
    startNow,
  });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}
