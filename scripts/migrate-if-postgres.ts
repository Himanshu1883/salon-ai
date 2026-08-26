import { execSync } from "node:child_process";
import { getMigrationDatabaseUrl } from "../src/lib/create-prisma-client";

const url = getMigrationDatabaseUrl() ?? "";
const isVercel = Boolean(process.env.VERCEL);

if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
  } catch (error) {
    console.warn(
      "prisma migrate deploy failed — will attempt catalog schema ensure.",
      error instanceof Error ? error.message : error
    );
  }

  try {
    execSync("npx tsx scripts/ensure-service-catalog-schema.ts", {
      stdio: "inherit",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (isVercel) {
      console.error(
        "CRITICAL: service catalog schema ensure failed on Vercel build.",
        message
      );
    } else {
      console.warn("Service catalog schema ensure failed:", message);
    }
  }

  try {
    execSync("npx tsx scripts/ensure-invoice-line-item-employee.ts", {
      stdio: "inherit",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (isVercel) {
      console.error(
        "CRITICAL: invoice line item employee column ensure failed on Vercel build.",
        message
      );
    } else {
      console.warn("Invoice line item employee column ensure failed:", message);
    }
  }

  try {
    execSync("npm run db:seed", { stdio: "inherit" });
    execSync("npm run db:backfill-slugs", { stdio: "inherit" });
  } catch (error) {
    console.warn(
      "Skipping database seed/backfill during build.",
      error instanceof Error ? error.message : error
    );
  }
} else {
  console.warn(
    "Skipping prisma migrate deploy: set DATABASE_URL, POSTGRES_URL, or DIRECT_DATABASE_URL to a PostgreSQL connection string."
  );
}
