import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getLayoutHeaderData } from "@/actions/dashboard";

/** Lightweight header badges — avoids server action round-trip from client. */
export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.salonId) {
    return NextResponse.json({ alertCount: 0, showUpgrade: false });
  }

  const data = await getLayoutHeaderData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
    },
  });
}
