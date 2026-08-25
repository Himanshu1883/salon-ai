import "dotenv/config";
import { defineConfig } from "prisma/config";
import { resolveDatabaseUrl } from "./src/lib/database-url";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url:
      resolveDatabaseUrl(true) ??
      process.env["DIRECT_DATABASE_URL"] ??
      process.env["POSTGRES_URL_NON_POOLING"] ??
      process.env["DATABASE_URL"] ??
      process.env["POSTGRES_URL"],
  },
});
