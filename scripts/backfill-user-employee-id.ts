import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { isMissingEmployeeIdColumn } from "../src/lib/employee-login-link";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const prisma = createPrismaClient();

  let users: Array<{
    id: string;
    email: string;
    salonId: string | null;
    role: string;
  }>;

  try {
    users = await prisma.user.findMany({
      where: {
        role: { not: "owner" },
        employeeId: null,
        salonId: { not: null },
      },
      select: {
        id: true,
        email: true,
        salonId: true,
        role: true,
      },
    });
  } catch (error) {
    if (isMissingEmployeeIdColumn(error)) {
      console.log("User.employeeId column is missing. Run migrations first.");
      process.exit(1);
    }
    throw error;
  }

  let updated = 0;
  let skipped = 0;

  for (const user of users) {
    if (!user.salonId) {
      skipped++;
      continue;
    }

    const employees = await prisma.employee.findMany({
      where: {
        salonId: user.salonId,
        email: { equals: user.email, mode: "insensitive" },
      },
      select: { id: true, email: true },
    });

    if (employees.length === 0) {
      skipped++;
      continue;
    }

    if (employees.length > 1) {
      skipped++;
      console.log(`SKIP ambiguous (${employees.length} employees): ${user.email}`);
      continue;
    }

    const employee = employees[0]!;

    const existingLink = await prisma.user.findFirst({
      where: {
        salonId: user.salonId,
        employeeId: employee.id,
        id: { not: user.id },
      },
      select: { id: true, email: true },
    });

    if (existingLink) {
      skipped++;
      console.log(
        `SKIP employee already linked to ${existingLink.email}: ${user.email}`
      );
      continue;
    }

    if (dryRun) {
      console.log(`WOULD UPDATE ${user.email} -> employee ${employee.id}`);
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { employeeId: employee.id },
      });
      console.log(`UPDATED ${user.email} -> employee ${employee.id}`);
    }

    updated++;
  }

  console.log(
    `${dryRun ? "Dry run complete" : "Backfill complete"}. ${
      dryRun ? "Would update" : "Updated"
    }: ${updated}, skipped: ${skipped}`
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
