import "dotenv/config";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";
import { getMigrationDatabaseUrl } from "../src/lib/create-prisma-client";
import { requiresRailwaySsl, resolveDatabaseUrl } from "../src/lib/database-url";

const SQL_FILE = resolve(
  __dirname,
  "sql/ensure-invoice-line-item-employee.sql"
);

async function columnExists(client: pg.Client): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'InvoiceLineItem'
        AND column_name = 'employeeId'
    ) AS "exists"
  `);
  return Boolean(result.rows[0]?.exists);
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
    const ready = await columnExists(client);
    if (ready) {
      console.log("InvoiceLineItem.employeeId already present.");
      return;
    }
    const sql = await import("node:fs/promises").then((fs) =>
      fs.readFile(SQL_FILE, "utf8")
    );
    await client.query(sql);
    console.log("Applied InvoiceLineItem.employeeId column.");
  } finally {
    await client.end();
  }
}

function ensureViaPrismaCli() {
  execSync(`npx prisma db execute --file "${SQL_FILE}"`, {
    stdio: "inherit",
    env: process.env,
  });
  console.log("Applied InvoiceLineItem.employeeId via Prisma CLI.");
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
  console.error("Failed to ensure InvoiceLineItem.employeeId:", error);
  process.exit(1);
});
