import { isRetryableDbError } from "@/lib/db-errors";
import { resetCachedPrismaClient } from "@/lib/create-prisma-client";
import { resetWarmDatabasePool } from "@/lib/warm-database-pool";

const MAX_ATTEMPTS = 3;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withDbRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryableDbError(error) || attempt === MAX_ATTEMPTS) {
        throw error;
      }

      console.warn(
        `[db] connection lost, retrying (${attempt}/${MAX_ATTEMPTS - 1})`
      );
      resetCachedPrismaClient();
      resetWarmDatabasePool();
      await wait(120 * attempt);
    }
  }

  throw lastError;
}
