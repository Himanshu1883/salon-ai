import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import {
  getPlanMonthlyAmount,
  getSubscriptionPlanName,
  normalizeSalonPlan,
} from "../src/lib/plans";

const prisma = createPrismaClient();

async function main() {
  const salons = await prisma.salon.findMany({
    select: { id: true, name: true, plan: true },
  });

  let updated = 0;

  for (const salon of salons) {
    const plan = normalizeSalonPlan(salon.plan);
    const result = await prisma.salonSubscription.updateMany({
      where: { salonId: salon.id },
      data: {
        planName: getSubscriptionPlanName(plan),
        monthlyAmount: getPlanMonthlyAmount(plan),
      },
    });

    if (result.count > 0) {
      updated += result.count;
      console.log(
        `Updated ${salon.name}: ${getSubscriptionPlanName(plan)} @ ₹${getPlanMonthlyAmount(plan)}`
      );
    }
  }

  console.log(`Synced ${updated} subscription record(s) across ${salons.length} salon(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
