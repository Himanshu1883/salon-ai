import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { DEMO_CREDENTIALS, syncDemoUserPasswords } from "../src/lib/demo-users";

const prisma = createPrismaClient();

async function main() {
  await syncDemoUserPasswords(prisma);
  console.log("Demo credentials:");
  for (const { email, password } of DEMO_CREDENTIALS) {
    console.log(`  ${email} / ${password}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
