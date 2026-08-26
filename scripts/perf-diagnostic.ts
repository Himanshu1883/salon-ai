/**
 * Performance diagnostic — measures DB latency for key flows.
 * Usage: npx tsx scripts/perf-diagnostic.ts [salonId]
 * Does NOT modify application code.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { performance } from "node:perf_hooks";
import { prisma } from "@/lib/prisma";
import { fetchDashboardPageData } from "@/lib/dashboard/page-data";
import { startOfWeek, endOfWeek, addDays, max, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

async function timed<T>(label: string, fn: () => Promise<T>) {
  const start = performance.now();
  const result = await fn();
  const ms = Math.round(performance.now() - start);
  console.log(`[PERF] ${label}: ${ms} ms`);
  return { ms, result };
}

async function measureConnection() {
  const start = performance.now();
  await prisma.$queryRaw`SELECT 1`;
  console.log(`[PERF] DB ping (SELECT 1): ${Math.round(performance.now() - start)} ms`);
}

async function measureLoginQueries(email: string) {
  console.log("\n--- LOGIN SIMULATION (DB stages only) ---");

  const userLookup = await timed("login user lookup (findUnique + salon + employee)", () =>
    prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        isActive: true,
        isSuperAdmin: true,
        platformRole: true,
        salonId: true,
        employeeId: true,
        employee: { select: { status: true } },
        salon: { select: { id: true, name: true, plan: true, slug: true } },
      },
    })
  );

  const user = userLookup.result;
  if (!user) {
    console.log("[PERF] No user found for login simulation — skipping password verify");
    return;
  }

  await timed("password verification (bcrypt.compare dummy)", async () => {
    await bcrypt.compare("dummy-password-for-timing", user.password);
  });

  if (user.role !== "owner" && !user.employee?.status && user.salonId) {
    await timed("login fallback employee lookup", () =>
      prisma.employee.findFirst({
        where: {
          salonId: user.salonId!,
          OR: [
            ...(user.employeeId ? [{ id: user.employeeId }] : []),
            { email: { equals: user.email, mode: "insensitive" as const } },
          ],
        },
        select: { status: true },
      })
    );
  }
}

async function measurePostLoginDashboard(salonId: string, userId: string) {
  console.log("\n--- POST-LOGIN DASHBOARD (layout + page simulation) ---");

  await timed("layout: salon + subscription + overdue invoice", () =>
    prisma.salon.findUnique({
      where: { id: salonId },
      select: {
        plan: true,
        subscription: { select: { status: true, trialEndsAt: true } },
        platformInvoices: {
          where: {
            status: { in: ["sent", "overdue"] },
            paidAt: null,
            dueDate: { lt: new Date() },
          },
          take: 1,
          select: { id: true },
        },
      },
    })
  );

  await timed("layout: permissions (RBAC user + role + overrides)", () =>
    prisma.user.findFirst({
      where: { id: userId, salonId },
      select: {
        id: true,
        role: true,
        salonRoleId: true,
        salonRole: {
          select: {
            key: true,
            hierarchyLevel: true,
            permissions: {
              select: { permission: { select: { key: true } } },
            },
          },
        },
        permissionOverrides: {
          select: {
            granted: true,
            permission: { select: { key: true } },
          },
        },
      },
    })
  );

  const now = new Date();
  await timed("layout: header alerts (5 parallel queries)", () =>
    Promise.all([
      prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*)::int AS count FROM "StockItem"
        WHERE "salonId" = ${salonId}
          AND ("quantityOnHand" <= 0 OR ("reorderLevel" IS NOT NULL AND "quantityOnHand" <= "reorderLevel"))
      `.then((r) => r[0]?.count ?? 0),
      Promise.all([
        prisma.invoice.aggregate({
          where: { salonId, status: "paid", paidAt: { gte: startOfDay(now), lte: endOfDay(now) } },
          _sum: { total: true },
        }),
        prisma.invoice.aggregate({
          where: { salonId, status: "paid", paidAt: { gte: startOfMonth(now), lte: endOfMonth(now) } },
          _sum: { total: true },
        }),
        prisma.invoice.count({ where: { salonId, status: { in: ["sent", "partial"] } } }),
      ]),
      prisma.smsReminder.count({ where: { salonId, status: "pending" } }).catch(() => 0),
      prisma.salonSubscription.findUnique({ where: { salonId } }),
    ])
  );

  await timed("dashboard: fetchDashboardPageData (19+ parallel queries)", () =>
    fetchDashboardPageData(salonId)
  );
}

async function measurePages(salonId: string) {
  console.log("\n--- REPRESENTATIVE PAGES (server data only) ---");

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const rangeEnd = max([weekEnd, addDays(now, 30)]);

  await timed("page customers: getCustomers", async () => {
    // Bypass requireSession by calling prisma path indirectly — use direct enrichment query count via getCustomers needs session
    // Simulate customer list queries directly
    const customers = await prisma.customer.findMany({
      where: { salonId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const customerIds = customers.map((c) => c.id);
    await Promise.all([
      prisma.invoice.groupBy({
        by: ["customerId"],
        where: { salonId, status: "paid", customerId: { in: customerIds } },
        _sum: { total: true },
      }),
      prisma.queueEntry.groupBy({
        by: ["customerId"],
        where: { salonId, status: "completed", customerId: { in: customerIds } },
        _count: { _all: true },
      }),
      prisma.appointment.groupBy({
        by: ["customerId"],
        where: { salonId, status: "completed", customerId: { in: customerIds } },
        _count: { _all: true },
      }),
    ]);
  });

  await timed("page appointments: range query", () =>
    prisma.appointment.findMany({
      where: {
        salonId,
        scheduledAt: { gte: weekStart, lte: rangeEnd },
        status: { not: "cancelled" },
      },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        customer: { select: { name: true, phone: true } },
        service: { select: { name: true, duration: true } },
        employee: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: "asc" },
    })
  );

  await timed("page team: employees + services", () =>
    prisma.employee.findMany({
      where: { salonId },
      include: { services: { include: { service: true } } },
      orderBy: { name: "asc" },
    })
  );

  await timed("page billing: invoices (take 500)", () =>
    prisma.invoice.findMany({
      where: { salonId },
      include: { lineItems: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    })
  );

  await timed("billing stats (3 aggregates)", async () => {
    const now = new Date();
    await Promise.all([
      prisma.invoice.aggregate({
        where: { salonId, status: "paid", paidAt: { gte: startOfDay(now), lte: endOfDay(now) } },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { salonId, status: "paid", paidAt: { gte: startOfMonth(now), lte: endOfMonth(now) } },
        _sum: { total: true },
      }),
      prisma.invoice.count({ where: { salonId, status: { in: ["sent", "partial"] } } }),
    ]);
  });
}

async function measurePaymentFlow(salonId: string) {
  console.log("\n--- PAYMENT SIMULATION (read path only) ---");

  const invoice = await prisma.invoice.findFirst({
    where: { salonId, status: { in: ["sent", "partial"] } },
    select: { id: true },
  });

  if (!invoice) {
    console.log("[PERF] No unpaid invoice found — skipping payment read simulation");
    return;
  }

  await timed("markInvoicePaid: invoice lookup", () =>
    prisma.invoice.findFirst({
      where: { id: invoice.id, salonId },
      select: {
        id: true,
        status: true,
        total: true,
        amountPaid: true,
        paidAt: true,
        customerId: true,
        employeeId: true,
        lineItems: {
          select: { itemType: true, stockItemId: true, quantity: true },
        },
      },
    })
  );
}

async function measureSlowQueries(salonId: string) {
  console.log("\n--- INDIVIDUAL QUERY LATENCY ---");

  const queries: Array<[string, () => Promise<unknown>]> = [
    ["invoice.aggregate today", () =>
      prisma.invoice.aggregate({
        where: { salonId, status: "paid", paidAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        _sum: { total: true },
      })],
    ["customer.count", () => prisma.customer.count({ where: { salonId } })],
    ["appointment.count today", () =>
      prisma.appointment.count({
        where: {
          salonId,
          scheduledAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
          status: { not: "cancelled" },
        },
      })],
    ["user.findUnique by email", async () => {
      const u = await prisma.user.findFirst({ where: { salonId }, select: { email: true } });
      if (!u?.email) return null;
      return prisma.user.findUnique({ where: { email: u.email }, select: { id: true } });
    }],
    ["segments: all paid invoices", () =>
      prisma.invoice.findMany({
        where: { salonId, status: "paid" },
        select: { customerId: true, total: true, paidAt: true },
      })],
    ["queue waiting entries", () =>
      prisma.queueEntry.findMany({
        where: { salonId, status: "waiting" },
        include: { services: { include: { service: true } } },
      })],
  ];

  for (const [label, fn] of queries) {
    await timed(label, fn);
  }
}

async function main() {
  console.log("========================================");
  console.log("PERFORMANCE DIAGNOSTIC (measurements)");
  console.log("========================================\n");

  await measureConnection();

  const salon =
    (process.argv[2]
      ? await prisma.salon.findUnique({ where: { id: process.argv[2] } })
      : null) ??
    (await prisma.salon.findFirst({ orderBy: { createdAt: "asc" } }));

  if (!salon) {
    console.error("No salon found");
    process.exit(1);
  }

  const owner = await prisma.user.findFirst({
    where: { salonId: salon.id, role: "owner" },
    select: { id: true, email: true },
  });

  console.log(`\nSalon: ${salon.name} (${salon.id})`);
  if (owner?.email) {
    await measureLoginQueries(owner.email);
  }

  if (owner) {
    await measurePostLoginDashboard(salon.id, owner.id);
  }

  await measurePages(salon.id);
  await measurePaymentFlow(salon.id);
  await measureSlowQueries(salon.id);

  console.log("\n--- NETWORK NOTE ---");
  console.log(
    "DB host appears to be Railway public proxy (hayabusa.proxy.rlwy.net)."
  );
  console.log(
    "Each query includes ~RTT to Railway region. Local dev latency is dominated by network, not query CPU."
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
