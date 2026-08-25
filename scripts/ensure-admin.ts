import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { syncDemoUserPasswords } from "../src/lib/demo-users";

const ADMIN_EMAIL = "admin@salon.ai";
const ADMIN_PASSWORD = "admin1234";

async function main() {
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: {
        password: hashed,
        isSuperAdmin: true,
        platformRole: "SUPER_ADMIN",
        isActive: true,
        salonId: null,
        name: existing.name || "Platform Admin",
      },
    });
    console.log(`Updated admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        password: hashed,
        name: "Platform Admin",
        role: "owner",
        isSuperAdmin: true,
        platformRole: "SUPER_ADMIN",
        salonId: null,
      },
    });
    console.log(`Created admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  await syncDemoUserPasswords(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
