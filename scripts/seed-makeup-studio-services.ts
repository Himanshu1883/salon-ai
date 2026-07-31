import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { seedMakeupStudioServices } from "../src/lib/seed-makeup-studio-services";

const prisma = createPrismaClient();

async function main() {
  const result = await seedMakeupStudioServices(prisma);
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
