import { NextResponse } from "next/server";
import { syncAllSalonOverdueStates } from "@/actions/subscription";

function authorizeCron(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncAllSalonOverdueStates();
  return NextResponse.json(result);
}
