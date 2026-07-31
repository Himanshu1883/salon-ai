import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";

const prisma = createPrismaClient();

async function main() {
  const salons = await prisma.salon.findMany({ select: { id: true } });

  for (const salon of salons) {
    const existing = await prisma.serviceCategory.count({
      where: { salonId: salon.id },
    });
    if (existing > 0) {
      console.log(`Salon ${salon.id}: categories already migrated`);
      continue;
    }

    const hairCategory = await prisma.serviceCategory.create({
      data: { salonId: salon.id, name: "Hair & styling", sortOrder: 0 },
    });
    const browCategory = await prisma.serviceCategory.create({
      data: { salonId: salon.id, name: "Eyebrows & eyelashes", sortOrder: 1 },
    });

    const services = await prisma.service.findMany({
      where: { salonId: salon.id },
      orderBy: { name: "asc" },
    });

    let hairOrder = 0;
    for (const service of services) {
      await prisma.service.update({
        where: { id: service.id },
        data: {
          categoryId: hairCategory.id,
          sortOrder: hairOrder++,
        },
      });
    }

    const hasBrowService = services.some((s) =>
      s.name.toLowerCase().includes("eyebrow")
    );
    if (!hasBrowService) {
      await prisma.service.create({
        data: {
          salonId: salon.id,
          name: "Eyebrow Shaping",
          duration: 20,
          price: 350,
          categoryId: browCategory.id,
          sortOrder: 0,
        },
      });
    }

    const supplierNames = [
      "Beauty Supply Co.",
      "Color Pro India",
      "Salon Essentials",
      "Pro Tools Direct",
    ];
    for (const name of supplierNames) {
      const exists = await prisma.supplier.findFirst({
        where: { salonId: salon.id, name },
      });
      if (!exists) {
        await prisma.supplier.create({ data: { salonId: salon.id, name } });
      }
    }

    console.log(`Salon ${salon.id}: migrated ${services.length} services`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
