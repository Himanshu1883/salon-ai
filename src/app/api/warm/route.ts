import { warmDatabasePool } from "@/lib/warm-database-pool";

export async function GET() {
  await warmDatabasePool();
  return Response.json({ ok: true });
}
