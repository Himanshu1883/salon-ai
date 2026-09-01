export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { warmDatabasePool } = await import("@/lib/warm-database-pool");
    await warmDatabasePool();
  }
}
