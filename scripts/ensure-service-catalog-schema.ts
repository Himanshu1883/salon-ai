import "dotenv/config";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";
import { getMigrationDatabaseUrl } from "../src/lib/create-prisma-client";
import { requiresRailwaySsl, resolveDatabaseUrl } from "../src/lib/database-url";

const SQL_FILE = resolve(
  __dirname,
  "sql/ensure-service-catalog-schema.sql"
);

async function tableExists(client: pg.Client, table: string): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = $1
    ) AS "exists"
    `,
    [table]
  );
  return Boolean(result.rows[0]?.exists);
}

async function columnExists(
  client: pg.Client,
  table: string,
  column: string
): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
    ) AS "exists"
    `,
    [table, column]
  );
  return Boolean(result.rows[0]?.exists);
}

async function applyImporterExtensions(client: pg.Client) {
  // Run as separate statements so ADD VALUE cannot abort ADD COLUMN.
  await client.query(`
    DO $$ BEGIN
      ALTER TYPE "ServiceAudience" ADD VALUE 'COUPLES';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await client.query(`
    ALTER TABLE "Service"
    ADD COLUMN IF NOT EXISTS "isStartingPrice" BOOLEAN NOT NULL DEFAULT false
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS "ServiceMenuImport" (
      "id" TEXT NOT NULL,
      "salonId" TEXT NOT NULL,
      "uploadedById" TEXT NOT NULL,
      "filename" TEXT NOT NULL,
      "fileType" TEXT NOT NULL,
      "totalRecords" INTEGER NOT NULL,
      "importedCount" INTEGER NOT NULL,
      "skippedCount" INTEGER NOT NULL,
      "failedCount" INTEGER NOT NULL,
      "warningCount" INTEGER NOT NULL DEFAULT 0,
      "categoriesCreated" INTEGER NOT NULL DEFAULT 0,
      "packagesCreated" INTEGER NOT NULL DEFAULT 0,
      "servicesCreated" INTEGER NOT NULL DEFAULT 0,
      "servicesReused" INTEGER NOT NULL DEFAULT 0,
      "summary" JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ServiceMenuImport_pkey" PRIMARY KEY ("id")
    )
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS "ServiceMenuImport_salonId_createdAt_idx"
    ON "ServiceMenuImport"("salonId", "createdAt")
  `);
  await client.query(`
    DO $$ BEGIN
      ALTER TABLE "ServiceMenuImport"
        ADD CONSTRAINT "ServiceMenuImport_salonId_fkey"
        FOREIGN KEY ("salonId") REFERENCES "Salon"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await client.query(`
    DO $$ BEGIN
      ALTER TABLE "ServiceMenuImport"
        ADD CONSTRAINT "ServiceMenuImport_uploadedById_fkey"
        FOREIGN KEY ("uploadedById") REFERENCES "User"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
}

async function ensureViaPg(
  url: string,
  ssl?: { rejectUnauthorized: boolean }
) {
  const client = new pg.Client({
    connectionString: url,
    ssl,
  });
  await client.connect();
  try {
    const catalogReady = await columnExists(client, "Service", "catalogType");
    const startingReady = await columnExists(
      client,
      "Service",
      "isStartingPrice"
    );
    const importerReady = await tableExists(client, "ServiceMenuImport");
    if (catalogReady && startingReady && importerReady) {
      console.log("Service catalog schema already present.");
      return;
    }
    if (!catalogReady) {
      const sql = await import("node:fs/promises").then((fs) =>
        fs.readFile(SQL_FILE, "utf8")
      );
      await client.query(sql);
      console.log("Applied service catalog schema.");
    }
    if (!startingReady || !importerReady) {
      await applyImporterExtensions(client);
      console.log("Applied service menu importer schema.");
    }
  } finally {
    await client.end();
  }
}

function ensureViaPrismaCli() {
  execSync(`npx prisma db execute --file "${SQL_FILE}"`, {
    stdio: "inherit",
    env: process.env,
  });
  console.log("Applied service catalog schema via Prisma CLI.");
}

async function main() {
  if (!existsSync(SQL_FILE)) {
    throw new Error(`Missing SQL file: ${SQL_FILE}`);
  }

  const url =
    getMigrationDatabaseUrl() ??
    resolveDatabaseUrl(true) ??
    resolveDatabaseUrl(false);
  if (!url) {
    console.warn(
      "No Postgres URL found — set DATABASE_URL, DIRECT_DATABASE_URL, or POSTGRES_URL."
    );
    process.exit(1);
  }

  const ssl = requiresRailwaySsl(url) ? { rejectUnauthorized: false } : undefined;

  try {
    await ensureViaPg(url, ssl);
  } catch (error) {
    console.warn(
      "Direct PG apply failed, retrying with prisma db execute:",
      error instanceof Error ? error.message : error
    );
    ensureViaPrismaCli();
  }
}

main().catch((error) => {
  console.error("Failed to ensure service catalog schema:", error);
  process.exit(1);
});
