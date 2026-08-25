import "dotenv/config";
import bcrypt from "bcryptjs";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { DEFAULT_STOCK_CATEGORY_NAMES } from "../src/lib/stock-categories";
import { syncDemoUserPasswords } from "../src/lib/demo-users";
import { slugifySalonName } from "../src/lib/salon-slug";
import { seedBasicPlanCustomers } from "../src/lib/seed-basic-plan-customers";
import { seedMakeupStudioServices, fixInvoiceLineItemDescriptions } from "../src/lib/seed-makeup-studio-services";
import { seedInventoryDemoForSalonEmails } from "../src/lib/seed-inventory-demo";
import { seedTestSalonAppointments } from "../src/lib/seed-test-salon-appointments";
import { seedMembershipPlansForSalon } from "../src/lib/seed-membership-plans";
import {
  getPlanMonthlyAmount,
  getSubscriptionPlanName,
  type SalonPlan,
} from "../src/lib/plans";
import { calculatePlatformInvoiceGst } from "../src/lib/platform-billing";
import { backfillAllSalonRoles } from "../src/lib/permissions/seed";

function getSubscriptionAmountForPlan(plan: SalonPlan) {
  return getPlanMonthlyAmount(plan);
}

function getSubscriptionNameForPlan(plan: SalonPlan) {
  return getSubscriptionPlanName(plan);
}

function getPlatformInvoiceTotals(baseAmount: number) {
  const { tax, total } = calculatePlatformInvoiceGst(baseAmount);
  return { amount: baseAmount, tax, total };
}

function getMonthPeriod(date = new Date()) {
  const periodStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  return { periodStart, periodEnd };
}

async function seedActiveSubscription(salonId: string, plan: SalonPlan = "ENTERPRISE") {
  const existing = await prisma.salonSubscription.findUnique({
    where: { salonId },
  });
  if (existing) return;

  const now = new Date();
  const { periodStart, periodEnd } = getMonthPeriod(now);
  const amount = getSubscriptionAmountForPlan(plan);
  const { tax, total } = getPlatformInvoiceTotals(amount);

  await prisma.salonSubscription.create({
    data: {
      salonId,
      status: "active",
      planName: getSubscriptionNameForPlan(plan),
      monthlyAmount: amount,
      setupFeePaid: true,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      trialEndsAt: null,
    },
  });

  const months = [
    { month: 0, year: 2026 },
    { month: 1, year: 2026 },
    { month: 2, year: 2026 },
  ];

  for (const [index, { month, year }] of months.entries()) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    await prisma.platformInvoice.create({
      data: {
        salonId,
        invoiceNumber: `SA-${year}-${String(index + 1).padStart(3, "0")}`,
        amount,
        tax,
        total,
        periodStart: start,
        periodEnd: end,
        dueDate: new Date(year, month, 8),
        paidAt: new Date(year, month, 5),
        status: "paid",
        paymentMethod: "upi",
      },
    });
  }
}

async function seedSuperAdmin() {
  const email = "admin@salon.ai";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const hashed = await bcrypt.hash("admin1234", 10);
  await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: "Platform Admin",
      role: "owner",
      isSuperAdmin: true,
      platformRole: "SUPER_ADMIN",
      salonId: null,
    },
  });

  console.log("Super admin: admin@salon.ai / admin1234");
}

async function seedOverdueTestSalon() {
  const email = "overdue@salon.ai";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const hashed = await bcrypt.hash("demo1234", 10);
  const now = new Date();
  const { periodStart, periodEnd } = getMonthPeriod(now);
  const amount = getSubscriptionAmountForPlan("ENTERPRISE");
  const { tax, total } = getPlatformInvoiceTotals(amount);
  const trialEnded = new Date(now);
  trialEnded.setDate(trialEnded.getDate() - 30);
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() - 10);

  const salon = await prisma.salon.create({
    data: {
      name: "Overdue Test Salon",
      slug: slugifySalonName("Overdue Test Salon"),
      phone: "+91 98765 43210",
      address: "456 Test Lane, Mumbai",
      totalSeats: 2,
      users: {
        create: {
          email,
          password: hashed,
          name: "Test Owner",
          role: "owner",
        },
      },
      seats: {
        create: [
          { number: 1, status: "available" },
          { number: 2, status: "available" },
        ],
      },
      subscription: {
        create: {
          status: "past_due",
          planName: getSubscriptionNameForPlan("ENTERPRISE"),
          monthlyAmount: amount,
          setupFeePaid: false,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          trialEndsAt: trialEnded,
        },
      },
    },
  });

  await prisma.platformInvoice.create({
    data: {
      salonId: salon.id,
      invoiceNumber: `SA-${now.getFullYear()}-999`,
      amount,
      tax,
      total,
      periodStart,
      periodEnd,
      dueDate,
      status: "overdue",
      notes: "Test invoice for subscription gate",
    },
  });

  console.log("Overdue test salon: overdue@salon.ai / demo1234");
}

async function seedTestUser() {
  const email = "test@abc.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.salonId) {
      await prisma.salon.update({
        where: { id: existing.salonId },
        data: { plan: "BASIC" },
      });
    }
    await seedBasicPlanCustomers(prisma);
    await seedMakeupStudioServices(prisma);
    await seedTestSalonAppointments(prisma);
    return;
  }

  const hashed = await bcrypt.hash("abc@123", 10);

  const salon = await prisma.salon.create({
    data: {
      name: "Test Salon",
      slug: slugifySalonName("Test Salon"),
      plan: "BASIC",
      phone: "+91 90000 00001",
      address: "1 Test Street, Mumbai",
      totalSeats: 2,
      users: {
        create: {
          email,
          password: hashed,
          name: "Test User",
          role: "owner",
        },
      },
      seats: {
        create: [
          { number: 1, status: "available" },
          { number: 2, status: "available" },
        ],
      },
    },
  });

  await seedActiveSubscription(salon.id, "BASIC");
  await seedBasicPlanCustomers(prisma);
  await seedMakeupStudioServices(prisma);
  await seedTestSalonAppointments(prisma);
  console.log("Test user: test@abc.com / abc@123");
}

const prisma = createPrismaClient();

async function seedDemoShifts(salonId: string, employeeIds: string[]) {
  const existing = await prisma.shift.count({ where: { salonId } });
  if (existing > 0) return;

  const weekStart = new Date("2026-07-27T00:00:00");
  const shifts: {
    salonId: string;
    employeeId: string;
    date: Date;
    startTime: string | null;
    endTime: string | null;
    isWorking: boolean;
  }[] = [];

  for (const employeeId of employeeIds) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + day);
      const isSunday = day === 6;
      shifts.push({
        salonId,
        employeeId,
        date,
        startTime: isSunday ? null : "10:00",
        endTime: isSunday ? null : "19:00",
        isWorking: !isSunday,
      });
    }
  }

  await prisma.shift.createMany({ data: shifts });
}

async function seedDemoProjects(
  salonId: string,
  employeeIds: string[]
) {
  const existing = await prisma.project.count({ where: { salonId } });
  if (existing > 0) return;

  const [ownerId, stylistId] = employeeIds;
  const now = new Date();

  await prisma.project.createMany({
    data: [
      {
        salonId,
        name: "Summer menu refresh",
        description: "Update service pricing and add seasonal packages",
        status: "PLANNING",
        priority: "MEDIUM",
        dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
        assignedEmployeeId: ownerId ?? null,
      },
      {
        salonId,
        name: "Reception area renovation",
        description: "New seating, lighting, and product display wall",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: new Date(now.getFullYear(), now.getMonth() + 2, 1),
        assignedEmployeeId: stylistId ?? ownerId ?? null,
      },
      {
        salonId,
        name: "Staff training — balayage",
        status: "ON_HOLD",
        priority: "LOW",
        assignedEmployeeId: stylistId ?? null,
      },
      {
        salonId,
        name: "Instagram launch campaign",
        description: "Before/after reels and booking link in bio",
        status: "COMPLETED",
        priority: "MEDIUM",
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 20),
      },
      {
        salonId,
        name: "Old POS migration",
        status: "CANCELED",
        description: "Replaced by Glow Desk billing module",
      },
    ],
  });

  console.log("Demo projects seeded.");
}

async function main() {
  await syncDemoUserPasswords(prisma);

  const hashed = await bcrypt.hash("demo1234", 10);

  const existing = await prisma.user.findUnique({
    where: { email: "demo@salon.ai" },
  });
  if (existing) {
    console.log("Demo data already exists. Skipping seed.");
    console.log("Demo login: demo@salon.ai / demo1234 at /luxe-hair-studio/login");
    const salon = await prisma.salon.findFirst({
      where: { users: { some: { email: "demo@salon.ai" } } },
    });
    if (salon) {
      await prisma.salon.update({
        where: { id: salon.id },
        data: { plan: "ENTERPRISE" },
      });

      const shubExists = await prisma.employee.findFirst({
        where: { salonId: salon.id, email: "shub@salon.ai" },
      });
      if (!shubExists) {
        await prisma.employee.create({
          data: {
            salonId: salon.id,
            name: "Shub Kumar",
            role: "owner",
            email: "shub@salon.ai",
            phone: "(555) 100-2000",
            specialties: "Salon management",
            status: "active",
          },
        });
        console.log("Added Shub Kumar to team.");
      }

      const employees = await prisma.employee.findMany({
        where: { salonId: salon.id, status: "active" },
        take: 2,
        orderBy: { name: "asc" },
      });
      if (employees.length >= 2) {
        await seedDemoShifts(
          salon.id,
          employees.map((e) => e.id)
        );
        console.log("Demo shifts seeded (if not already present).");
      }

      await seedActiveSubscription(salon.id);
      await seedOverdueTestSalon();
      await seedTestUser();
      await seedSuperAdmin();
      await seedInventoryDemoForSalonEmails(prisma, [
        "demo@salon.ai",
        "test@abc.com",
      ]);
      await seedTestSalonAppointments(prisma);
      await fixInvoiceLineItemDescriptions(prisma);
      const allEmployees = await prisma.employee.findMany({
        where: { salonId: salon.id, status: "active" },
        orderBy: { name: "asc" },
        take: 3,
      });
      await seedDemoProjects(
        salon.id,
        allEmployees.map((e) => e.id)
      );
    }
    return;
  }

  const salon = await prisma.salon.create({
    data: {
      name: "Luxe Hair Studio",
      slug: slugifySalonName("Luxe Hair Studio"),
      plan: "ENTERPRISE",
      phone: "(555) 123-4567",
      address: "123 Beauty Lane, San Francisco, CA",
      totalSeats: 6,
      users: {
        create: {
          email: "demo@salon.ai",
          password: hashed,
          name: "Alex Rivera",
          role: "owner",
        },
      },
      seats: {
        create: Array.from({ length: 6 }, (_, i) => ({
          number: i + 1,
          status: "available",
        })),
      },
    },
  });

  const employees = await Promise.all(
    [
      {
        name: "Shub Kumar",
        role: "owner",
        specialties: "Salon management",
        email: "shub@salon.ai",
        phone: "(555) 100-2000",
      },
      { name: "Jordan Lee", role: "stylist", specialties: "Color, balayage" },
      { name: "Sam Chen", role: "stylist", specialties: "Cuts, styling" },
      { name: "Taylor Brooks", role: "receptionist", specialties: "Front desk" },
      { name: "Morgan Davis", role: "manager", specialties: "Operations" },
    ].map((emp) =>
      prisma.employee.create({
        data: { salonId: salon.id, status: "active", ...emp },
      })
    )
  );

  const hairCategory = await prisma.serviceCategory.create({
    data: { salonId: salon.id, name: "Hair & styling", sortOrder: 0 },
  });

  const browCategory = await prisma.serviceCategory.create({
    data: { salonId: salon.id, name: "Eyebrows & eyelashes", sortOrder: 1 },
  });

  const services = await Promise.all(
    [
      {
        name: "Women's Haircut",
        duration: 45,
        price: 800,
        categoryId: hairCategory.id,
        sortOrder: 0,
      },
      {
        name: "Men's Haircut",
        duration: 30,
        price: 400,
        categoryId: hairCategory.id,
        sortOrder: 1,
      },
      {
        name: "Full Color",
        duration: 120,
        price: 3500,
        categoryId: hairCategory.id,
        sortOrder: 2,
      },
      {
        name: "Highlights",
        duration: 90,
        price: 2800,
        categoryId: hairCategory.id,
        sortOrder: 3,
      },
      {
        name: "Blowout",
        duration: 30,
        price: 600,
        categoryId: hairCategory.id,
        sortOrder: 4,
      },
      {
        name: "Deep Conditioning",
        duration: 45,
        price: 900,
        categoryId: hairCategory.id,
        sortOrder: 5,
      },
      {
        name: "Eyebrow Shaping",
        duration: 20,
        price: 350,
        categoryId: browCategory.id,
        sortOrder: 0,
      },
    ].map((svc) =>
      prisma.service.create({
        data: { salonId: salon.id, ...svc },
      })
    )
  );

  await prisma.supplier.createMany({
    data: [
      {
        salonId: salon.id,
        name: "Beauty Supply Co.",
        phone: "(555) 111-2222",
      },
      {
        salonId: salon.id,
        name: "Color Pro India",
        phone: "(555) 333-4444",
      },
      {
        salonId: salon.id,
        name: "Salon Essentials",
      },
      {
        salonId: salon.id,
        name: "Pro Tools Direct",
      },
    ],
  });

  await prisma.employeeService.createMany({
    data: [
      { employeeId: employees[1].id, serviceId: services[2].id },
      { employeeId: employees[1].id, serviceId: services[3].id },
      { employeeId: employees[2].id, serviceId: services[0].id },
      { employeeId: employees[2].id, serviceId: services[1].id },
      { employeeId: employees[2].id, serviceId: services[4].id },
    ],
  });

  await seedDemoShifts(salon.id, [employees[0].id, employees[1].id]);

  const customer = await prisma.customer.create({
    data: {
      salonId: salon.id,
      name: "Jamie Wilson",
      phone: "(555) 987-6543",
      email: "jamie@example.com",
      notes: "Prefers morning appointments",
      birthday: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 10);
        d.setFullYear(1990);
        return d;
      })(),
    },
  });

  const riley = await prisma.customer.create({
    data: {
      salonId: salon.id,
      name: "Riley Chen",
      phone: "(555) 222-3333",
      email: "riley@example.com",
      birthday: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 5);
        d.setFullYear(1988);
        return d;
      })(),
    },
  });

  const alex = await prisma.customer.create({
    data: {
      salonId: salon.id,
      name: "Alex Morgan",
      phone: "(555) 444-5555",
      birthday: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 22);
        d.setFullYear(1995);
        return d;
      })(),
    },
  });

  const priya = await prisma.customer.create({
    data: {
      salonId: salon.id,
      name: "Priya Sharma",
      phone: "(555) 666-7777",
      email: "priya@example.com",
      createdAt: new Date(),
    },
  });

  const oldClient = await prisma.customer.create({
    data: {
      salonId: salon.id,
      name: "Chris Taylor",
      phone: "(555) 888-9999",
      createdAt: (() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 8);
        return d;
      })(),
    },
  });

  await prisma.queueEntry.create({
    data: {
      salonId: salon.id,
      customerId: customer.id,
      position: 1,
      status: "waiting",
      services: { create: [{ serviceId: services[0].id }] },
    },
  });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(14, 0, 0, 0);

  await prisma.queueEntry.create({
    data: {
      salonId: salon.id,
      customerId: riley.id,
      employeeId: employees[1].id,
      position: 1,
      status: "completed",
      checkedInAt: yesterday,
      completedAt: yesterday,
      services: { create: [{ serviceId: services[1].id }] },
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const appointment = await prisma.appointment.create({
    data: {
      salonId: salon.id,
      customerId: customer.id,
      serviceId: services[2].id,
      employeeId: employees[0].id,
      scheduledAt: tomorrow,
    },
  });

  const subtotal = services[0].price;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;

  const seats = await prisma.seat.findMany({
    where: { salonId: salon.id },
    orderBy: { number: "asc" },
  });

  await prisma.invoice.create({
    data: {
      salonId: salon.id,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      status: "paid",
      employeeId: employees[1].id,
      seatId: seats[0]?.id,
      subtotal,
      tax,
      total: subtotal + tax,
      paidAt: new Date(),
      paymentMethod: "card",
      lineItems: {
        create: [{
          description: services[0].name,
          quantity: 1,
          unitPrice: services[0].price,
          total: services[0].price,
          serviceId: services[0].id,
        }],
      },
    },
  });

  const subtotal2 = services[2].price;
  const tax2 = Math.round(subtotal2 * 0.08 * 100) / 100;
  await prisma.invoice.create({
    data: {
      salonId: salon.id,
      customerId: riley.id,
      customerName: riley.name,
      customerPhone: riley.phone,
      status: "paid",
      employeeId: employees[0].id,
      seatId: seats[1]?.id,
      subtotal: subtotal2,
      tax: tax2,
      total: subtotal2 + tax2,
      paidAt: new Date(),
      paymentMethod: "upi",
      lineItems: {
        create: [{
          description: services[2].name,
          quantity: 1,
          unitPrice: services[2].price,
          total: services[2].price,
          serviceId: services[2].id,
        }],
      },
    },
  });

  const subtotal3 = services[4].price;
  const tax3 = Math.round(subtotal3 * 0.08 * 100) / 100;
  await prisma.invoice.create({
    data: {
      salonId: salon.id,
      customerId: alex.id,
      customerName: alex.name,
      customerPhone: alex.phone,
      status: "sent",
      employeeId: employees[1].id,
      subtotal: subtotal3,
      tax: tax3,
      total: subtotal3 + tax3,
      dueDate: new Date(),
      lineItems: {
        create: [{
          description: services[4].name,
          quantity: 1,
          unitPrice: services[4].price,
          total: services[4].price,
          serviceId: services[4].id,
        }],
      },
    },
  });

  const pastMissed = new Date();
  pastMissed.setDate(pastMissed.getDate() - 3);
  pastMissed.setHours(11, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      salonId: salon.id,
      customerId: priya.id,
      serviceId: services[0].id,
      employeeId: employees[1].id,
      scheduledAt: pastMissed,
      status: "scheduled",
    },
  });

  const lapsedDate1 = new Date();
  lapsedDate1.setMonth(lapsedDate1.getMonth() - 6);
  const lapsedDate2 = new Date();
  lapsedDate2.setMonth(lapsedDate2.getMonth() - 9);
  const lapsedDate3 = new Date();
  lapsedDate3.setMonth(lapsedDate3.getMonth() - 10);

  for (const [cust, paidAt, amount] of [
    [oldClient, lapsedDate1, services[1].price] as const,
    [oldClient, lapsedDate2, services[4].price] as const,
    [oldClient, lapsedDate3, services[0].price] as const,
  ]) {
    const sub = amount;
    const taxAmt = Math.round(sub * 0.08 * 100) / 100;
    await prisma.invoice.create({
      data: {
        salonId: salon.id,
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        status: "paid",
        employeeId: employees[0].id,
        subtotal: sub,
        tax: taxAmt,
        total: sub + taxAmt,
        paidAt,
        paymentMethod: "cash",
        lineItems: {
          create: [{
            description: "Historical service",
            quantity: 1,
            unitPrice: sub,
            total: sub,
          }],
        },
      },
    });
  }

  const vipDate = new Date();
  vipDate.setMonth(vipDate.getMonth() - 2);
  const vipSub = 6000;
  const vipTax = Math.round(vipSub * 0.08 * 100) / 100;
  await prisma.invoice.create({
    data: {
      salonId: salon.id,
      customerId: riley.id,
      customerName: riley.name,
      customerPhone: riley.phone,
      status: "paid",
      employeeId: employees[0].id,
      subtotal: vipSub,
      tax: vipTax,
      total: vipSub + vipTax,
      paidAt: vipDate,
      paymentMethod: "card",
      lineItems: {
        create: [{
          description: services[2].name,
          quantity: 1,
          unitPrice: vipSub,
          total: vipSub,
          serviceId: services[2].id,
        }],
      },
    },
  });

  const reminderTime = new Date(tomorrow);
  reminderTime.setHours(reminderTime.getHours() - 24);
  await prisma.smsReminder.create({
    data: {
      salonId: salon.id,
      type: "appointment_reminder",
      recipientPhone: customer.phone!,
      recipientName: customer.name,
      message: `Hi ${customer.name}! Reminder: your ${services[2].name} appointment is tomorrow at 10:00 AM.`,
      scheduledAt: reminderTime,
      appointmentId: appointment.id,
    },
  });

  const stockCategories = await Promise.all(
    DEFAULT_STOCK_CATEGORY_NAMES.map((name, sortOrder) =>
      prisma.stockCategory.create({
        data: { salonId: salon.id, name, sortOrder },
      })
    )
  );

  const stockCategoryByName = Object.fromEntries(
    stockCategories.map((category) => [category.name, category.id])
  );

  const stockItems = await Promise.all(
    [
      {
        name: "Professional Shampoo 1L",
        sku: "SHP-001",
        category: "shampoo",
        unit: "bottle",
        quantityOnHand: 0,
        reorderLevel: 5,
      },
      {
        name: "Hair Color - Medium Brown",
        sku: "CLR-MB-50",
        category: "color",
        unit: "box",
        quantityOnHand: 0,
        reorderLevel: 3,
      },
      {
        name: "Disposable Gloves (100 pack)",
        sku: "GLV-100",
        category: "supplies",
        unit: "pack",
        quantityOnHand: 0,
        reorderLevel: 2,
      },
      {
        name: "Professional Hair Dryer",
        sku: "TL-DRY-01",
        category: "tools",
        unit: "piece",
        quantityOnHand: 0,
        reorderLevel: 1,
      },
      {
        name: "Conditioner Treatment 500ml",
        sku: "CON-500",
        category: "shampoo",
        unit: "bottle",
        quantityOnHand: 0,
        reorderLevel: 4,
      },
    ].map((item) =>
      prisma.stockItem.create({
        data: {
          salonId: salon.id,
          name: item.name,
          sku: item.sku,
          categoryId: stockCategoryByName[item.category],
          unit: item.unit,
          quantityOnHand: item.quantityOnHand,
          reorderLevel: item.reorderLevel,
        },
      })
    )
  );

  const purchaseDate = new Date();
  purchaseDate.setDate(purchaseDate.getDate() - 7);

  await prisma.stockPurchase.create({
    data: {
      salonId: salon.id,
      stockItemId: stockItems[0].id,
      quantityPurchased: 12,
      amount: 4800,
      unitCost: 400,
      supplierName: "Beauty Supply Co.",
      purchaseDate,
    },
  });
  await prisma.stockItem.update({
    where: { id: stockItems[0].id },
    data: { quantityOnHand: 12 },
  });

  await prisma.stockPurchase.create({
    data: {
      salonId: salon.id,
      stockItemId: stockItems[1].id,
      quantityPurchased: 8,
      amount: 6400,
      unitCost: 800,
      supplierName: "Color Pro India",
      purchaseDate,
    },
  });
  await prisma.stockItem.update({
    where: { id: stockItems[1].id },
    data: { quantityOnHand: 8 },
  });

  await prisma.stockPurchase.create({
    data: {
      salonId: salon.id,
      stockItemId: stockItems[2].id,
      quantityPurchased: 3,
      amount: 900,
      unitCost: 300,
      supplierName: "Salon Essentials",
      purchaseDate,
    },
  });
  await prisma.stockItem.update({
    where: { id: stockItems[2].id },
    data: { quantityOnHand: 3 },
  });

  await prisma.stockPurchase.create({
    data: {
      salonId: salon.id,
      stockItemId: stockItems[3].id,
      quantityPurchased: 2,
      amount: 12000,
      unitCost: 6000,
      supplierName: "Pro Tools Direct",
      purchaseDate,
    },
  });
  await prisma.stockItem.update({
    where: { id: stockItems[3].id },
    data: { quantityOnHand: 2 },
  });

  // Low stock demo item
  await prisma.stockPurchase.create({
    data: {
      salonId: salon.id,
      stockItemId: stockItems[4].id,
      quantityPurchased: 2,
      amount: 1600,
      unitCost: 800,
      supplierName: "Beauty Supply Co.",
      purchaseDate,
    },
  });
  await prisma.stockItem.update({
    where: { id: stockItems[4].id },
    data: { quantityOnHand: 2 },
  });

  const brand = await prisma.productBrand.create({
    data: { salonId: salon.id, name: "L'Oréal Professionnel" },
  });

  await prisma.stockItem.update({
    where: { id: stockItems[0].id },
    data: {
      brandId: brand.id,
      costPrice: 400,
      retailPrice: 650,
      avgCost: 400,
      gstRate: 18,
      isRetail: true,
    },
  });

  await prisma.stockItem.update({
    where: { id: stockItems[1].id },
    data: { costPrice: 800, retailPrice: 1200, avgCost: 800, gstRate: 18 },
  });

  await prisma.branch.create({
    data: {
      salonId: salon.id,
      name: salon.name,
      address: salon.address,
      isMain: true,
    },
  });

  await prisma.serviceRecipe.createMany({
    data: [
      {
        salonId: salon.id,
        serviceId: services[0].id,
        stockItemId: stockItems[0].id,
        quantity: 1,
        unit: "bottle",
      },
      {
        salonId: salon.id,
        serviceId: services[2].id,
        stockItemId: stockItems[1].id,
        quantity: 1,
        unit: "box",
      },
      {
        salonId: salon.id,
        serviceId: services[0].id,
        stockItemId: stockItems[2].id,
        quantity: 1,
        unit: "pack",
      },
    ],
  });

  console.log("Seed complete!");
  console.log("Demo login: demo@salon.ai / demo1234 at /luxe-hair-studio/login");
  console.log("Test login: test@abc.com / abc@123 at /test-salon/login");

  await seedActiveSubscription(salon.id);
  await seedOverdueTestSalon();
  await seedTestUser();
  await seedSuperAdmin();
  await seedInventoryDemoForSalonEmails(prisma, ["demo@salon.ai", "test@abc.com"]);
  const allSalons = await prisma.salon.findMany({ select: { id: true } });
  for (const s of allSalons) {
    await seedMembershipPlansForSalon(prisma, s.id);
  }
  await fixInvoiceLineItemDescriptions(prisma);
  await seedDemoProjects(
    salon.id,
    employees.map((e) => e.id)
  );
  await backfillAllSalonRoles(prisma);
  console.log("RBAC roles and permissions backfilled for all salons.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
