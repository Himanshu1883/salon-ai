import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool, type PoolConfig } from "pg";

const globalForPrisma = globalThis as unknown as {
  pgPool: Pool | undefined;
  prisma: PrismaClient | undefined;
};

function isPostgresUrl(url: string | undefined): url is string {
  return (
    !!url &&
    (url.startsWith("postgres://") || url.startsWith("postgresql://"))
  );
}

/** Prefer pooled runtime URLs; never use direct/migration-only env vars for the app. */
function getRuntimeDatabaseUrl(): string {
  const candidates = [
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL,
  ].filter(isPostgresUrl);

  const url = candidates[0];
  if (!url) {
    throw new Error(
      "DATABASE_URL is required. Set it to a PostgreSQL connection string (Vercel Postgres, Neon, Prisma Postgres, or local Postgres)."
    );
  }

  return normalizeConnectionUrl(url);
}

/** Prefer Neon pooler endpoint for serverless when a direct host is configured. */
function toPooledDatabaseUrl(url: string): string {
  if (url.includes("@db.prisma.io")) {
    return url.replace("@db.prisma.io", "@pooled.db.prisma.io");
  }
  if (url.includes(".neon.tech") && !url.includes("-pooler.")) {
    try {
      const parsed = new URL(url);
      parsed.hostname = parsed.hostname.replace(
        ".neon.tech",
        "-pooler.neon.tech"
      );
      return parsed.toString();
    } catch {
      return url;
    }
  }
  return url;
}

/** Append serverless-safe Postgres session options when missing. */
function withStatementTimeout(url: string): string {
  if (url.includes("statement_timeout")) return url;
  // Prisma Postgres pooled endpoints reject libpq `options` query params.
  if (url.includes("db.prisma.io") || url.includes(".neon.tech")) return url;

  try {
    const parsed = new URL(url);
    const existing = parsed.searchParams.get("options");
    const timeoutOption = "-c statement_timeout=15000";
    parsed.searchParams.set(
      "options",
      existing ? `${existing} ${timeoutOption}` : timeoutOption
    );
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Prefer libpq-compatible SSL params to avoid pg driver warnings on Vercel. */
function normalizeConnectionUrl(url: string): string {
  const pooled = toPooledDatabaseUrl(url);

  try {
    const parsed = new URL(pooled);
    const sslmode = parsed.searchParams.get("sslmode");

    if (
      (sslmode === "require" ||
        sslmode === "prefer" ||
        sslmode === "verify-ca") &&
      !parsed.searchParams.has("uselibpqcompat")
    ) {
      parsed.searchParams.set("uselibpqcompat", "true");
    }

    return withStatementTimeout(parsed.toString());
  } catch {
    return withStatementTimeout(pooled);
  }
}

function getPoolConfig(): PoolConfig {
  const isServerless = Boolean(process.env.VERCEL);
  // Cross-region DB (e.g. ap-southeast-1 Prisma Postgres vs Vercel iad1) needs
  // longer connect timeouts and warm keep-alive to avoid cold-start failures.
  return {
    connectionString: getRuntimeDatabaseUrl(),
    max: isServerless ? 1 : 10,
    idleTimeoutMillis: isServerless ? 10_000 : 30_000,
    connectionTimeoutMillis: isServerless ? 25_000 : 15_000,
    keepAlive: true,
    allowExitOnIdle: isServerless,
  };
}

function getPgPool(): Pool {
  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = new Pool(getPoolConfig());
  }
  return globalForPrisma.pgPool;
}

export function createPrismaClient() {
  const pool = getPgPool();
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

/** Direct/non-pooled URL for Prisma CLI migrations only. */
export function getMigrationDatabaseUrl(): string | undefined {
  const candidates = [
    process.env.DIRECT_DATABASE_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
  ].filter(isPostgresUrl);

  return candidates[0];
}
