import { NextResponse } from "next/server";
import { getDataScopeContextFromAuth } from "@/lib/permissions/data-scope";
import { PermissionDeniedError } from "@/lib/permissions/require";
import {
  fetchCheckInServicesPage,
  parseCheckInServicesQuery,
} from "@/lib/queue/check-in-services";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ctx = await getDataScopeContextFromAuth();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const payload = await fetchCheckInServicesPage(
      ctx.salonId,
      parseCheckInServicesQuery(searchParams)
    );

    return NextResponse.json(payload, {
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
