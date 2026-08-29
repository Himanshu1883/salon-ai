import { getPrismaClient } from "@/lib/create-prisma-client";

let warmPromise: Promise<void> | undefined;

export function resetWarmDatabasePool() {
  warmPromise = undefined;
}

/** Establish the Postgres pool early so the first real query avoids cold-connect latency. */
export function warmDatabasePool(): Promise<void> {
  if (!warmPromise) {
    warmPromise = (async () => {
      try {
        const prisma = getPrismaClient();
        await prisma.$queryRaw`SELECT 1`;
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
