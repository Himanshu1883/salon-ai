import "dotenv/config";
import { Pool } from "pg";
import {
  isRailwayPrivateUrl,
  requiresRailwaySsl,
  resolveDatabaseUrl,
} from "../src/lib/database-url";

async function main() {
  const url = resolveDatabaseUrl(false) ?? resolveDatabaseUrl(true);
  if (!url) {
    console.error("DATABASE_URL is missing from .env");
    process.exit(1);
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    console.error("DATABASE_URL is not a valid URL.");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: url,
    ...(requiresRailwaySsl(url)
      ? { ssl: { rejectUnauthorized: false } }
      : {}),
  });

  try {
    const result = await pool.query("select current_database() as db, current_user as user");
    const row = result.rows[0] as { db: string; user: string };
    console.log(`Database connection OK (${row.user}@${row.db}).`);

    const tables = await pool.query<{ exists: boolean }>(
      "select to_regclass('public.\"User\"') is not null as exists"
    );
    if (!tables.rows[0]?.exists) {
      console.log("Tables not found yet. Run: npm run db:migrate");
      process.exit(1);
    }

    const admin = await pool.query<{ count: string }>(
      `select count(*)::text as count from "User" where email = 'admin@salon.ai'`
    );
    if (admin.rows[0]?.count === "0") {
      console.log("Admin user missing. Run: npm run db:ensure-admin");
      process.exit(1);
    }

    console.log("Admin user exists. Login: admin@salon.ai / admin1234");
  } catch (error) {
    console.error("Database connection failed.");
    console.error(`Host: ${parsed.hostname}:${parsed.port || "5432"}`);
    console.error(`User: ${decodeURIComponent(parsed.username)}`);
    console.error(`Database: ${parsed.pathname.replace(/^\//, "")}`);
    console.error("");

    const databaseUrl = process.env.DATABASE_URL ?? "";
    if (
      isRailwayPrivateUrl(databaseUrl) &&
      !process.env.DATABASE_PUBLIC_URL
    ) {
      console.error("DATABASE_URL uses Railway's private host (*.railway.internal).");
      console.error("Add DATABASE_PUBLIC_URL to .env with the public TCP URL from Railway:");
      console.error("  Railway → Postgres → Connect → Public Network");
      console.error("  (host looks like something.proxy.rlwy.net:PORT)");
    } else if (isRailwayPrivateUrl(databaseUrl)) {
      console.error(
        "DATABASE_PUBLIC_URL is set but connection still failed. Verify the public URL and password in Railway."
      );
    } else {
      console.error("Update DATABASE_URL in .env with a valid PostgreSQL connection string.");
    }

    console.error("");
    if (error instanceof Error) console.error(error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
