import { NextResponse } from "next/server";
import { getDataScopeContextFromAuth } from "@/lib/permissions/data-scope";
import {
  getAppointmentsPageData,
  type AppointmentsPagePart,
} from "@/lib/appointments/page-data";
import { resolveAppointmentsRangeStart } from "@/lib/appointments/page-windows";

export const dynamic = "force-dynamic";

const PARTS = new Set<AppointmentsPagePart>([
  "bootstrap",
  "week",
  "upcoming",
]);

export async function GET(request: Request) {
  const ctx = await getDataScopeContextFromAuth();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const part = (searchParams.get("part") ?? "bootstrap") as AppointmentsPagePart;
  if (!PARTS.has(part)) {
    return NextResponse.json({ error: "Invalid part" }, { status: 400 });
  }

  const weekStartIso = resolveAppointmentsRangeStart(
    searchParams.get("weekStart") ?? undefined
  );

  const data = await getAppointmentsPageData(ctx, part, weekStartIso);

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}
