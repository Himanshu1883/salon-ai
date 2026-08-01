import { execSync } from "node:child_process";
import { getMigrationDatabaseUrl } from "../src/lib/create-prisma-client";

const url = getMigrationDatabaseUrl() ?? "";

if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    execSync("npm run db:seed", { stdio: "inherit" });
    execSync("npm run db:backfill-slugs", { stdio: "inherit" });
  } catch (error) {
    console.warn(
      "Skipping database migrate/seed during build (database unreachable or seed failed).",
      error instanceof Error ? error.message : error
    );
  }
} else {
  console.warn(
    "Skipping prisma migrate deploy: set DATABASE_URL or POSTGRES_URL to a PostgreSQL connection string."
  );
}
