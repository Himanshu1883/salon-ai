import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { backfillAllSalonRoles } from "../src/lib/permissions/seed";

async function main() {
  const prisma = createPrismaClient();
  await backfillAllSalonRoles(prisma);
  console.log("RBAC backfill complete.");
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
