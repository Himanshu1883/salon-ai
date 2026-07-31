import type { PrismaClient } from "@/generated/prisma/client";
import { DEFAULT_STOCK_CATEGORY_NAMES } from "@/lib/stock-categories";
import { subDays } from "date-fns";

export const INVENTORY_DEMO_MARKER = "DEMO-INV-SEED-V1";

type ProductDef = {
  sku: string;
  name: string;
  category: string;
  brand?: string;
  supplier?: string;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
  costPrice: number;
  retailPrice: number;
  gstRate: number;
  isRetail: boolean;
  shelfLocation?: string;
  expiryDate?: Date;
  description?: string;
};

const DEMO_BRANDS = [
  "L'Oréal Professionnel",
  "Schwarzkopf",
  "Wella Professionals",
  "Kérastase",
  "Salon Pro",
] as const;

const DEMO_SUPPLIERS = [
  {
    name: "Beauty Supply Co.",
    phone: "+91 98765 43210",
    email: "orders@beautysupply.in",
    address: "Andheri East, Mumbai",
  },
  {
    name: "Color Pro India",
    phone: "+91 99887 76655",
    email: "sales@colorpro.in",
    address: "Bandra West, Mumbai",
  },
  {
    name: "Salon Essentials",
    phone: "+91 91234 56789",
    email: "hello@salonessentials.in",
    address: "Koramangala, Bangalore",
  },
  {
    name: "Pro Tools Direct",
    phone: "+91 90000 11122",
    email: "support@protools.in",
    address: "Connaught Place, Delhi",
  },
] as const;

const DEMO_PRODUCTS: ProductDef[] = [
  {
    sku: "DEMO-INV-001",
    name: "L'Oréal Serie Expert Shampoo 1L",
    category: "shampoo",
    brand: "L'Oréal Professionnel",
    supplier: "Beauty Supply Co.",
    unit: "bottle",
    quantityOnHand: 24,
    reorderLevel: 8,
    costPrice: 420,
    retailPrice: 699,
    gstRate: 18,
    isRetail: true,
    shelfLocation: "A-01",
  },
  {
    sku: "DEMO-INV-002",
    name: "Schwarzkopf Igora Hair Color - 6.0 Dark Blonde",
    category: "color",
    brand: "Schwarzkopf",
    supplier: "Color Pro India",
    unit: "tube",
    quantityOnHand: 18,
    reorderLevel: 6,
    costPrice: 380,
    retailPrice: 599,
    gstRate: 18,
    isRetail: false,
    shelfLocation: "B-02",
  },
  {
    sku: "DEMO-INV-003",
    name: "Wella Koleston Perfect - Medium Brown",
    category: "color",
    brand: "Wella Professionals",
    supplier: "Color Pro India",
    unit: "tube",
    quantityOnHand: 14,
    reorderLevel: 5,
    costPrice: 350,
    retailPrice: 549,
    gstRate: 18,
    isRetail: false,
    shelfLocation: "B-03",
  },
  {
    sku: "DEMO-INV-004",
    name: "Kérastase Nutritive Mask 500ml",
    category: "shampoo",
    brand: "Kérastase",
    supplier: "Beauty Supply Co.",
    unit: "jar",
    quantityOnHand: 12,
    reorderLevel: 4,
    costPrice: 890,
    retailPrice: 1299,
    gstRate: 18,
    isRetail: true,
    shelfLocation: "A-04",
  },
  {
    sku: "DEMO-INV-005",
    name: "Disposable Nitrile Gloves (100 pack)",
    category: "supplies",
    brand: "Salon Pro",
    supplier: "Salon Essentials",
    unit: "pack",
    quantityOnHand: 32,
    reorderLevel: 10,
    costPrice: 280,
    retailPrice: 450,
    gstRate: 12,
    isRetail: false,
    shelfLocation: "C-01",
  },
  {
    sku: "DEMO-INV-006",
    name: "Cotton Pads Box (200 pcs)",
    category: "supplies",
    brand: "Salon Pro",
    supplier: "Salon Essentials",
    unit: "box",
    quantityOnHand: 20,
    reorderLevel: 8,
    costPrice: 120,
    retailPrice: 199,
    gstRate: 12,
    isRetail: true,
    shelfLocation: "C-02",
  },
  {
    sku: "DEMO-INV-007",
    name: "Professional Ionic Hair Dryer",
    category: "tools",
    brand: "Salon Pro",
    supplier: "Pro Tools Direct",
    unit: "piece",
    quantityOnHand: 4,
    reorderLevel: 2,
    costPrice: 4500,
    retailPrice: 6999,
    gstRate: 18,
    isRetail: true,
    shelfLocation: "D-01",
  },
  {
    sku: "DEMO-INV-008",
    name: "Ceramic Flat Iron 1.25 inch",
    category: "tools",
    brand: "Salon Pro",
    supplier: "Pro Tools Direct",
    unit: "piece",
    quantityOnHand: 3,
    reorderLevel: 1,
    costPrice: 3200,
    retailPrice: 4999,
    gstRate: 18,
    isRetail: true,
    shelfLocation: "D-02",
  },
  {
    sku: "DEMO-INV-009",
    name: "Nail Polish Remover 500ml",
    category: "supplies",
    brand: "Salon Pro",
    supplier: "Salon Essentials",
    unit: "bottle",
    quantityOnHand: 2,
    reorderLevel: 10,
    costPrice: 95,
    retailPrice: 175,
    gstRate: 18,
    isRetail: true,
    shelfLocation: "C-03",
  },
  {
    sku: "DEMO-INV-010",
    name: "Acetone 1L",
    category: "supplies",
    brand: "Salon Pro",
    supplier: "Salon Essentials",
    unit: "bottle",
    quantityOnHand: 1,
    reorderLevel: 5,
    costPrice: 110,
    retailPrice: 199,
    gstRate: 18,
    isRetail: false,
    shelfLocation: "C-04",
  },
  {
    sku: "DEMO-INV-011",
    name: "Oxy Life Face Bleach Cream",
    category: "other",
    brand: "Salon Pro",
    supplier: "Beauty Supply Co.",
    unit: "pack",
    quantityOnHand: 8,
    reorderLevel: 4,
    costPrice: 85,
    retailPrice: 149,
    gstRate: 12,
    isRetail: true,
    shelfLocation: "E-01",
    expiryDate: subDays(new Date(), -18),
  },
  {
    sku: "DEMO-INV-012",
    name: "Wax Beans - Chocolate 800g",
    category: "supplies",
    brand: "Salon Pro",
    supplier: "Salon Essentials",
    unit: "pack",
    quantityOnHand: 10,
    reorderLevel: 4,
    costPrice: 320,
    retailPrice: 499,
    gstRate: 12,
    isRetail: false,
    shelfLocation: "C-05",
  },
  {
    sku: "DEMO-INV-013",
    name: "After Wax Soothing Oil 200ml",
    category: "supplies",
    brand: "Salon Pro",
    supplier: "Salon Essentials",
    unit: "bottle",
    quantityOnHand: 5,
    reorderLevel: 8,
    costPrice: 180,
    retailPrice: 299,
    gstRate: 12,
    isRetail: true,
    shelfLocation: "C-06",
  },
  {
    sku: "DEMO-INV-014",
    name: "Bridal Touch-up Makeup Kit",
    category: "other",
    brand: "Salon Pro",
    supplier: "Beauty Supply Co.",
    unit: "kit",
    quantityOnHand: 6,
    reorderLevel: 2,
    costPrice: 2200,
    retailPrice: 3499,
    gstRate: 18,
    isRetail: true,
    shelfLocation: "E-02",
  },
  {
    sku: "DEMO-INV-015",
    name: "Hand Sanitizer 500ml",
    category: "supplies",
    brand: "Salon Pro",
    supplier: "Salon Essentials",
    unit: "bottle",
    quantityOnHand: 22,
    reorderLevel: 10,
    costPrice: 140,
    retailPrice: 249,
    gstRate: 12,
    isRetail: true,
    shelfLocation: "C-07",
  },
  {
    sku: "DEMO-INV-016",
    name: "Strong Hold Styling Gel 250ml",
    category: "shampoo",
    brand: "L'Oréal Professionnel",
    supplier: "Beauty Supply Co.",
    unit: "tube",
    quantityOnHand: 9,
    reorderLevel: 5,
    costPrice: 260,
    retailPrice: 449,
    gstRate: 18,
    isRetail: true,
    shelfLocation: "A-05",
  },
  {
    sku: "DEMO-INV-017",
    name: "Threading Spool (Premium Cotton)",
    category: "supplies",
    brand: "Salon Pro",
    supplier: "Salon Essentials",
    unit: "spool",
    quantityOnHand: 35,
    reorderLevel: 12,
    costPrice: 45,
    retailPrice: 89,
    gstRate: 5,
    isRetail: false,
    shelfLocation: "C-08",
  },
  {
    sku: "DEMO-INV-018",
    name: "Disposable Head Caps (100 pack)",
    category: "supplies",
    brand: "Salon Pro",
    supplier: "Salon Essentials",
    unit: "pack",
    quantityOnHand: 16,
    reorderLevel: 6,
    costPrice: 150,
    retailPrice: 249,
    gstRate: 12,
    isRetail: false,
    shelfLocation: "C-09",
  },
];

export async function seedInventoryDemo(
  prisma: PrismaClient,
  salonId: string,
  options?: { salonName?: string }
) {
  const marker = await prisma.stockItem.findFirst({
    where: { salonId, sku: INVENTORY_DEMO_MARKER },
  });
  if (marker) {
    return { seeded: false, reason: "already_seeded" as const };
  }

  const categoryRecords = await Promise.all(
    DEFAULT_STOCK_CATEGORY_NAMES.map(async (name, sortOrder) =>
      prisma.stockCategory.upsert({
        where: { salonId_name: { salonId, name } },
        create: { salonId, name, sortOrder },
        update: {},
      })
    )
  );
  const categoryByName = Object.fromEntries(
    categoryRecords.map((category) => [category.name, category.id])
  );

  const brandRecords = await Promise.all(
    DEMO_BRANDS.map((name) =>
      prisma.productBrand.upsert({
        where: { salonId_name: { salonId, name } },
        create: { salonId, name },
        update: {},
      })
    )
  );
  const brandByName = Object.fromEntries(
    brandRecords.map((brand) => [brand.name, brand.id])
  );

  const supplierRecords = await Promise.all(
    DEMO_SUPPLIERS.map(async (supplier) => {
      const existing = await prisma.supplier.findFirst({
        where: { salonId, name: supplier.name },
      });
      if (existing) return existing;
      return prisma.supplier.create({
        data: { salonId, ...supplier },
      });
    })
  );
  const supplierByName = Object.fromEntries(
    supplierRecords.map((supplier) => [supplier.name, supplier.id])
  );

  await prisma.branch.upsert({
    where: { salonId_name: { salonId, name: options?.salonName ?? "Main Branch" } },
    create: {
      salonId,
      name: options?.salonName ?? "Main Branch",
      isMain: true,
    },
    update: {},
  }).catch(async () => {
    const existing = await prisma.branch.findFirst({ where: { salonId, isMain: true } });
    if (!existing) {
      await prisma.branch.create({
        data: {
          salonId,
          name: options?.salonName ?? "Main Branch",
          isMain: true,
        },
      });
    }
  });

  const stockItems = await Promise.all(
    DEMO_PRODUCTS.map((product) =>
      prisma.stockItem.create({
        data: {
          salonId,
          sku: product.sku,
          name: product.name,
          categoryId: categoryByName[product.category],
          brandId: product.brand ? brandByName[product.brand] : null,
          supplierId: product.supplier ? supplierByName[product.supplier] : null,
          unit: product.unit,
          quantityOnHand: product.quantityOnHand,
          reorderLevel: product.reorderLevel,
          costPrice: product.costPrice,
          retailPrice: product.retailPrice,
          avgCost: product.costPrice,
          gstRate: product.gstRate,
          isRetail: product.isRetail,
          shelfLocation: product.shelfLocation,
          expiryDate: product.expiryDate,
          description: product.description,
          status: "active",
        },
      })
    )
  );

  await prisma.stockItem.create({
    data: {
      salonId,
      sku: INVENTORY_DEMO_MARKER,
      name: "Inventory Demo Seed Marker",
      categoryId: categoryByName.other,
      unit: "piece",
      quantityOnHand: 0,
      reorderLevel: 0,
      costPrice: 0,
      retailPrice: 0,
      avgCost: 0,
      status: "inactive",
      isRetail: false,
    },
  });

  const purchaseDate = subDays(new Date(), 14);
  for (const item of stockItems) {
    const product = DEMO_PRODUCTS.find((p) => p.sku === item.sku)!;
    await prisma.stockPurchase.create({
      data: {
        salonId,
        stockItemId: item.id,
        quantityPurchased: product.quantityOnHand,
        amount: product.quantityOnHand * product.costPrice,
        unitCost: product.costPrice,
        supplierName: product.supplier ?? "Beauty Supply Co.",
        purchaseDate,
      },
    });

    await prisma.stockLedgerEntry.create({
      data: {
        salonId,
        stockItemId: item.id,
        movementType: "purchase",
        quantity: product.quantityOnHand,
        quantityAfter: product.quantityOnHand,
        unitCost: product.costPrice,
        referenceType: "seed",
        notes: "Initial demo stock purchase",
        createdAt: purchaseDate,
      },
    });
  }

  const employee = await prisma.employee.findFirst({
    where: { salonId, status: "active" },
    orderBy: { name: "asc" },
  });

  const movementTemplates: {
    itemIndex: number;
    type: string;
    qty: number;
    daysAgo: number;
  }[] = [
    { itemIndex: 0, type: "consumption", qty: -2, daysAgo: 2 },
    { itemIndex: 1, type: "consumption", qty: -1, daysAgo: 3 },
    { itemIndex: 3, type: "sale", qty: -1, daysAgo: 1 },
    { itemIndex: 5, type: "sale", qty: -2, daysAgo: 4 },
    { itemIndex: 8, type: "consumption", qty: -1, daysAgo: 5 },
    { itemIndex: 15, type: "sale", qty: -1, daysAgo: 6 },
    { itemIndex: 0, type: "purchase", qty: 6, daysAgo: 8 },
    { itemIndex: 2, type: "purchase", qty: 4, daysAgo: 10 },
    { itemIndex: 4, type: "purchase", qty: 10, daysAgo: 12 },
    { itemIndex: 11, type: "consumption", qty: -2, daysAgo: 7 },
    { itemIndex: 13, type: "sale", qty: -1, daysAgo: 9 },
    { itemIndex: 6, type: "issue", qty: -1, daysAgo: 11 },
  ];

  for (const move of movementTemplates) {
    const item = stockItems[move.itemIndex];
    if (!item) continue;
    const createdAt = subDays(new Date(), move.daysAgo);
    const qtyAfter = Math.max(0, item.quantityOnHand + move.qty);
    await prisma.stockLedgerEntry.create({
      data: {
        salonId,
        stockItemId: item.id,
        movementType: move.type,
        quantity: move.qty,
        quantityAfter: qtyAfter,
        unitCost: item.avgCost,
        employeeId: employee?.id,
        notes: `Demo ${move.type} movement`,
        createdAt,
      },
    });
  }

  if (employee) {
    await prisma.staffProductIssue.create({
      data: {
        salonId,
        stockItemId: stockItems[6].id,
        employeeId: employee.id,
        quantity: 1,
        notes: "Demo issue for styling station",
        issueDate: subDays(new Date(), 11),
      },
    });
  }

  const poSupplier = supplierByName["Color Pro India"];
  const openPo = await prisma.purchaseOrder.create({
    data: {
      salonId,
      orderNumber: `PO-${new Date().getFullYear()}-0042`,
      supplierId: poSupplier,
      status: "ordered",
      orderDate: subDays(new Date(), 3),
      expectedDate: subDays(new Date(), -4),
      notes: "Reorder hair color tubes",
      lines: {
        create: [
          {
            stockItemId: stockItems[1].id,
            quantityOrdered: 12,
            quantityReceived: 0,
            unitCost: 380,
          },
          {
            stockItemId: stockItems[2].id,
            quantityOrdered: 10,
            quantityReceived: 0,
            unitCost: 350,
          },
          {
            stockItemId: stockItems[8].id,
            quantityOrdered: 20,
            quantityReceived: 0,
            unitCost: 95,
          },
        ],
      },
    },
  });

  await prisma.purchaseOrder.create({
    data: {
      salonId,
      orderNumber: `PO-${new Date().getFullYear()}-0043`,
      supplierId: supplierByName["Salon Essentials"],
      status: "draft",
      orderDate: new Date(),
      notes: "Monthly supplies restock",
      lines: {
        create: [
          {
            stockItemId: stockItems[4].id,
            quantityOrdered: 15,
            quantityReceived: 0,
            unitCost: 280,
          },
          {
            stockItemId: stockItems[17].id,
            quantityOrdered: 8,
            quantityReceived: 0,
            unitCost: 150,
          },
        ],
      },
    },
  });

  await prisma.stockAdjustment.create({
    data: {
      salonId,
      stockItemId: stockItems[9].id,
      adjustmentType: "decrease",
      quantity: 1,
      reason: "damaged",
      notes: "Leaking bottle removed from shelf",
      createdAt: subDays(new Date(), 6),
    },
  });

  const services = await prisma.service.findMany({
    where: { salonId },
    take: 3,
    orderBy: { name: "asc" },
  });

  if (services[0]) {
    await prisma.serviceRecipe.createMany({
      data: [
        {
          salonId,
          serviceId: services[0].id,
          stockItemId: stockItems[0].id,
          quantity: 1,
          unit: "bottle",
        },
        {
          salonId,
          serviceId: services[0].id,
          stockItemId: stockItems[4].id,
          quantity: 1,
          unit: "pack",
        },
      ],
      skipDuplicates: true,
    });
  }

  if (services[1]) {
    await prisma.serviceRecipe.createMany({
      data: [
        {
          salonId,
          serviceId: services[1].id,
          stockItemId: stockItems[1].id,
          quantity: 1,
          unit: "tube",
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log(
    `Inventory demo seeded for salon ${salonId}: ${stockItems.length} products, PO ${openPo.orderNumber}`
  );

  return { seeded: true, productCount: stockItems.length };
}

export async function seedInventoryDemoForSalonEmails(
  prisma: PrismaClient,
  emails: string[]
) {
  for (const email of emails) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { salon: { select: { id: true, name: true } } },
    });
    if (!user?.salonId) continue;
    await seedInventoryDemo(prisma, user.salonId, {
      salonName: user.salon?.name ?? "Main Branch",
    });
  }
}
