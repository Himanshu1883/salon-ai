import { getPrismaClient } from "@/lib/create-prisma-client";

let warmPromise: Promise<void> | undefined;

export function resetWarmDatabasePool() {
  warmPromise = undefined;
}

async function ensureQueueServiceEmployeeColumn() {
  const prisma = getPrismaClient();
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "QueueService" ADD COLUMN IF NOT EXISTS "employeeId" TEXT`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "QueueService_employeeId_idx" ON "QueueService"("employeeId")`
  );
}

/** Establish the Postgres pool early so the first real query avoids cold-connect latency. */
export function warmDatabasePool(): Promise<void> {
  if (!warmPromise) {
    warmPromise = (async () => {
      try {
        const prisma = getPrismaClient();
        await prisma.$queryRaw`SELECT 1`;
        try {
          await ensureQueueServiceEmployeeColumn();
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[db] QueueService.employeeId ensure failed:", error);
          }
        }
      } catch (error) {
        warmPromise = undefined;
        if (process.env.NODE_ENV === "development") {
          console.warn("[db] pool warm-up failed:", error);
        }
      }
    })();
  }

  return warmPromise;
}
