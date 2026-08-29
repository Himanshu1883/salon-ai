import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getQueueOverview } from "@/actions/queue-overview";
import { PermissionDeniedError } from "@/lib/permissions/require";

/** Lightweight queue snapshot for client-side refresh without full RSC reload. */
export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.salonId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const overview = await getQueueOverview();
    return NextResponse.json(
      {
        entries: overview.entries,
        estimatedWait: overview.estimatedWait,
        completedEntries: overview.completedRecent,
        stats: overview.stats,
        tabCounts: overview.tabCounts,
        kpis: overview.kpis,
        sidebar: overview.sidebar,
        insights: overview.insights,
        completedToday: overview.completedToday,
        cancelledToday: overview.cancelledToday,
        noShowToday: overview.noShowToday,
        appointmentsToday: overview.appointmentsToday,
        employees: overview.employees,
        seats: overview.seats,
        services: overview.services,
        revenueToday: overview.revenueToday,
        generatedAt: overview.generatedAt,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
