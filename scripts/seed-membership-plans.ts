import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { seedMembershipPlansForSalon } from "../src/lib/seed-membership-plans";

async function main() {
  const prisma = createPrismaClient();
  const salons = await prisma.salon.findMany({ select: { id: true, name: true } });
  for (const salon of salons) {
    await seedMembershipPlansForSalon(prisma, salon.id);
    console.log(`Membership plans seeded for ${salon.name}`);
  }
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
