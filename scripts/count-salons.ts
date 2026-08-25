import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const salonCount = await prisma.salon.count();
  const withSub = await prisma.salon.count({
    where: { subscription: { isNot: null } },
  });
  const salons = await prisma.salon.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      subscription: { select: { status: true } },
      _count: { select: { users: true } },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  console.log(`Total salons: ${salonCount}`);
  console.log(`Salons with subscription row: ${withSub}`);
  for (const s of salons) {
    console.log(
      `- ${s.name} (${s.slug}) sub=${s.subscription?.status ?? "none"} users=${s._count.users}`
    );
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
