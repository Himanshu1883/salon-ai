import type { PrismaClient } from "@/generated/prisma/client";

const TEST_USER_EMAIL = "test@abc.com";

type ServiceDef = {
  name: string;
  duration: number;
  price: number;
};

type CategoryDef = {
  name: string;
  services: ServiceDef[];
};

const MAKEUP_STUDIO_CATALOG: CategoryDef[] = [
  {
    name: "Hair Services",
    services: [
      { name: "Women's Haircut", duration: 45, price: 600 },
      { name: "Men's Haircut", duration: 30, price: 350 },
      { name: "Hair Color (Full)", duration: 120, price: 3500 },
      { name: "Highlights (Partial)", duration: 90, price: 2500 },
      { name: "Highlights (Full Head)", duration: 120, price: 4000 },
      { name: "Keratin Treatment", duration: 180, price: 6000 },
      { name: "Blow Dry", duration: 30, price: 500 },
      { name: "Hair Spa", duration: 60, price: 1200 },
      { name: "Hair Wash & Conditioning", duration: 30, price: 400 },
      { name: "Trim & Style", duration: 30, price: 450 },
    ],
  },
  {
    name: "Makeup",
    services: [
      { name: "Party Makeup", duration: 60, price: 3500 },
      { name: "Engagement Makeup", duration: 90, price: 6000 },
      { name: "Reception Makeup", duration: 90, price: 5500 },
      { name: "HD Makeup", duration: 75, price: 4500 },
      { name: "Airbrush Makeup", duration: 90, price: 7000 },
      { name: "Natural / No-Makeup Look", duration: 45, price: 2500 },
      { name: "Smokey Eye Makeup", duration: 60, price: 4000 },
    ],
  },
  {
    name: "Bridal",
    services: [
      { name: "Bridal Makeup", duration: 120, price: 15000 },
      { name: "Pre-Bridal Package (3 Sessions)", duration: 240, price: 12000 },
      { name: "Bridal Hair Styling", duration: 90, price: 5000 },
      { name: "Saree Draping", duration: 30, price: 1500 },
      { name: "Lehenga Draping", duration: 45, price: 2000 },
      { name: "Mehendi (Hands)", duration: 120, price: 2500 },
      { name: "Mehendi (Hands & Feet)", duration: 180, price: 4000 },
    ],
  },
  {
    name: "Skin & Facials",
    services: [
      { name: "Cleanup", duration: 45, price: 800 },
      { name: "Gold Facial", duration: 60, price: 1500 },
      { name: "Diamond Facial", duration: 75, price: 2500 },
      { name: "De-tan Pack", duration: 45, price: 900 },
      { name: "Bleach (Face)", duration: 30, price: 400 },
      { name: "Bleach (Full Body)", duration: 60, price: 1500 },
      { name: "Fruit Facial", duration: 60, price: 1200 },
    ],
  },
  {
    name: "Nails",
    services: [
      { name: "Manicure (Basic)", duration: 45, price: 500 },
      { name: "Pedicure (Basic)", duration: 60, price: 700 },
      { name: "Gel Nails", duration: 90, price: 1500 },
      { name: "Nail Art (per nail)", duration: 15, price: 100 },
      { name: "French Manicure", duration: 60, price: 800 },
      { name: "Spa Pedicure", duration: 75, price: 1200 },
    ],
  },
  {
    name: "Waxing & Threading",
    services: [
      { name: "Full Body Wax", duration: 90, price: 2500 },
      { name: "Half Legs Wax", duration: 30, price: 400 },
      { name: "Full Legs Wax", duration: 45, price: 600 },
      { name: "Underarms Wax", duration: 15, price: 150 },
      { name: "Bikini Wax", duration: 30, price: 500 },
      { name: "Eyebrow Threading", duration: 15, price: 80 },
      { name: "Upper Lip Threading", duration: 10, price: 50 },
      { name: "Full Face Threading", duration: 30, price: 300 },
      { name: "Chin Threading", duration: 10, price: 40 },
    ],
  },
  {
    name: "Packages",
    services: [
      { name: "Bride Package", duration: 240, price: 25000 },
      { name: "Party Package", duration: 120, price: 7000 },
      { name: "Groom Package", duration: 90, price: 5000 },
      { name: "Pre-Wedding Glow Package", duration: 180, price: 8000 },
    ],
  },
  {
    name: "Add-ons",
    services: [
      { name: "Hair Extensions (per piece)", duration: 30, price: 500 },
      { name: "False Lashes", duration: 15, price: 500 },
      { name: "Bindi & Accessories Setup", duration: 15, price: 300 },
      { name: "Touch-up Kit", duration: 15, price: 1500 },
      { name: "Travel Charges (Within City)", duration: 0, price: 1000 },
    ],
  },
];

export type MakeupStudioSeedResult = {
  salonId: string | null;
  salonName: string | null;
  categoriesCreated: number;
  servicesCreated: number;
  skipped: boolean;
};

export async function seedMakeupStudioServices(
  prisma: PrismaClient
): Promise<MakeupStudioSeedResult> {
  const user = await prisma.user.findUnique({
    where: { email: TEST_USER_EMAIL },
    include: { salon: true },
  });

  if (!user?.salonId) {
    console.log(
      `seedMakeupStudioServices: ${TEST_USER_EMAIL} not found, skipping.`
    );
    return {
      salonId: null,
      salonName: null,
      categoriesCreated: 0,
      servicesCreated: 0,
      skipped: true,
    };
  }

  const salonId = user.salonId;
  const salonName = user.salon?.name ?? "Unknown";

  const existingMarkerCount = await prisma.service.count({
    where: {
      salonId,
      category: { name: { in: MAKEUP_STUDIO_CATALOG.map((c) => c.name) } },
    },
  });

  if (existingMarkerCount > 0) {
    const categoryCount = await prisma.serviceCategory.count({
      where: {
        salonId,
        name: { in: MAKEUP_STUDIO_CATALOG.map((c) => c.name) },
      },
    });
    console.log(
      `seedMakeupStudioServices: catalog already seeded for ${salonName} (${salonId}). ${existingMarkerCount} services, ${categoryCount} categories.`
    );
    return {
      salonId,
      salonName,
      categoriesCreated: 0,
      servicesCreated: 0,
      skipped: true,
    };
  }

  let categoriesCreated = 0;
  let servicesCreated = 0;

  for (const [categoryIndex, categoryDef] of MAKEUP_STUDIO_CATALOG.entries()) {
    const category = await prisma.serviceCategory.create({
      data: {
        salonId,
        name: categoryDef.name,
        sortOrder: categoryIndex,
      },
    });
    categoriesCreated++;

    for (const [serviceIndex, serviceDef] of categoryDef.services.entries()) {
      await prisma.service.create({
        data: {
          salonId,
          categoryId: category.id,
          name: serviceDef.name,
          description: null,
          duration: serviceDef.duration,
          price: serviceDef.price,
          sortOrder: serviceIndex,
        },
      });
      servicesCreated++;
    }
  }

  console.log(
    `seedMakeupStudioServices: created ${categoriesCreated} categories and ${servicesCreated} services for ${salonName} (${salonId}).`
  );

  return {
    salonId,
    salonName,
    categoriesCreated,
    servicesCreated,
    skipped: false,
  };
}

/** Fix invoice line items that stored internal seed marker instead of service names. */
export async function fixInvoiceLineItemDescriptions(prisma: PrismaClient) {
  const { MAKEUP_STUDIO_MARKER } = await import("./service-display");

  await prisma.service.updateMany({
    where: { description: MAKEUP_STUDIO_MARKER },
    data: { description: null },
  });

  const badItems = await prisma.invoiceLineItem.findMany({
    where: {
      serviceId: { not: null },
      OR: [
        { description: MAKEUP_STUDIO_MARKER },
        { description: "" },
      ],
    },
    include: { service: { select: { name: true } } },
  });

  let fixed = 0;
  for (const item of badItems) {
    if (!item.service?.name) continue;
    await prisma.invoiceLineItem.update({
      where: { id: item.id },
      data: { description: item.service.name },
    });
    fixed++;
  }

  if (fixed > 0) {
    console.log(`fixInvoiceLineItemDescriptions: updated ${fixed} line item(s).`);
  }

  return fixed;
}
