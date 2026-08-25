import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool, type PoolConfig } from "pg";
import {
  requiresRailwaySsl,
  resolveDatabaseUrl,
} from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as {
  pgPool: Pool | undefined;
  prisma: PrismaClient | undefined;
  pgPoolConnectionString: string | undefined;
};

/** Prefer pooled runtime URLs; never use direct/migration-only env vars for the app. */
function getRuntimeDatabaseUrl(): string {
  const url = resolveDatabaseUrl(false);
  if (!url) {
    throw new Error(
      "DATABASE_URL is required. Set it to a PostgreSQL connection string (Vercel Postgres, Neon, Prisma Postgres, Railway, or local Postgres)."
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
  // Managed Postgres proxies reject libpq `options` query params.
  if (
    url.includes("db.prisma.io") ||
    url.includes(".neon.tech") ||
    url.includes(".proxy.rlwy.net") ||
    url.includes(".railway.internal")
  ) {
    return url;
  }

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
  const connectionString = getRuntimeDatabaseUrl();
  const config: PoolConfig = {
    connectionString,
    max: isServerless ? 1 : 10,
    idleTimeoutMillis: isServerless ? 10_000 : 30_000,
    connectionTimeoutMillis: isServerless ? 25_000 : 15_000,
    keepAlive: true,
    allowExitOnIdle: isServerless,
  };

  if (requiresRailwaySsl(connectionString)) {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}

function getPgPool(): Pool {
  const connectionString = getRuntimeDatabaseUrl();

  if (
    globalForPrisma.pgPool &&
    globalForPrisma.pgPoolConnectionString !== connectionString
  ) {
    void globalForPrisma.pgPool.end();
    globalForPrisma.pgPool = undefined;
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = new Pool(getPoolConfig());
    globalForPrisma.pgPoolConnectionString = connectionString;
  }

  return globalForPrisma.pgPool;
}

export function getPrismaClient(): PrismaClient {
  getPgPool();

  if (!globalForPrisma.prisma) {
    const pool = globalForPrisma.pgPool!;
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.prisma;
}

export function createPrismaClient() {
  return getPrismaClient();
}

/** Direct/non-pooled URL for Prisma CLI migrations only. */
export function getMigrationDatabaseUrl(): string | undefined {
  return resolveDatabaseUrl(true);
}
