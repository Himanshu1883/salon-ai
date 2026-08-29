import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getCheckInOverview } from "@/actions/queue-overview";
import { PermissionDeniedError } from "@/lib/permissions/require";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.salonId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const overview = await getCheckInOverview();
    return NextResponse.json(overview, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    throw error;
  }
}
