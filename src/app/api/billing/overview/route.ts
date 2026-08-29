import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getBillingOverview } from "@/actions/billing";
import { BILLING_PAGE_SIZE } from "@/lib/billing/invoice-list-query";
import { PermissionDeniedError } from "@/lib/permissions/require";

export async function GET(request: Request) {
  const session = await getAuthSession();
  if (!session?.user?.salonId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(
    searchParams.get("pageSize") ?? String(BILLING_PAGE_SIZE)
  );

  try {
    const overview = await getBillingOverview({
      status: searchParams.get("status") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      employeeId: searchParams.get("employeeId") || undefined,
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : BILLING_PAGE_SIZE,
    });

    return NextResponse.json(overview, {
      headers: {
        "Cache-Control": "private, max-age=15, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    throw error;
  }
}
