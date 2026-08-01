import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { seedTestSalonAppointments } from "../src/lib/seed-test-salon-appointments";

const prisma = createPrismaClient();

async function main() {
  await seedTestSalonAppointments(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
