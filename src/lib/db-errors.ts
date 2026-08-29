const RETRYABLE_PRISMA_CODES = new Set([
  "P1001",
  "P1002",
  "P1008",
  "P1017",
  "P2024",
]);

const RETRYABLE_MESSAGE =
  /terminat|connection (?:refused|reset|closed|timed out|ended|not available)|not queryable|ECONNRESET|ETIMEDOUT|EPIPE|AdminShutdown|too many clients|server closed the connection|Can't reach database|Timed out fetching|Connection terminated/i;

export function isRetryableDbError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return typeof error === "string" && RETRYABLE_MESSAGE.test(error);
  }

  const code =
    "code" in error && error.code != null ? String(error.code) : "";
  if (RETRYABLE_PRISMA_CODES.has(code)) return true;
  if (code === "ECONNRESET" || code === "ETIMEDOUT" || code === "EPIPE") {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);
  if (RETRYABLE_MESSAGE.test(message)) return true;

  const cause = "cause" in error ? error.cause : undefined;
  if (cause && cause !== error) return isRetryableDbError(cause);

  return false;
}
