import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { seedBasicPlanCustomers } from "../src/lib/seed-basic-plan-customers";

const prisma = createPrismaClient();

async function main() {
  const result = await seedBasicPlanCustomers(prisma);
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
