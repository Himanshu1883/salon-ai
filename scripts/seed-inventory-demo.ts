import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { seedInventoryDemoForSalonEmails } from "../src/lib/seed-inventory-demo";

const prisma = createPrismaClient();

async function main() {
  await seedInventoryDemoForSalonEmails(prisma, [
    "demo@salon.ai",
    "test@abc.com",
  ]);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
