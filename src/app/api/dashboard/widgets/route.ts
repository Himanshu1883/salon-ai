import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getDashboardWidgets } from "@/actions/dashboard";

/** Secondary dashboard widgets for client-side deferred loading. */
export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.salonId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const widgets = await getDashboardWidgets();
  return NextResponse.json(widgets, {
    headers: {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
    },
  });
}
