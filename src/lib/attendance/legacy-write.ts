/** Detect Prisma client/schema mismatch (stale generated client). */
export function isPrismaClientValidationError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "name" in error &&
    (error as { name?: string }).name === "PrismaClientValidationError"
  );
}
