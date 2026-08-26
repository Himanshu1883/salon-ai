/**
 * Benchmark staff analytics query count and latency.
 * Usage: npx tsx scripts/benchmark-staff-analytics.ts [salonId] [employeeId|null]
 */
import { prisma } from "@/lib/prisma";
import {
  fetchStaffAnalytics,
  fetchStaffAnalyticsCharts,
  fetchStaffAnalyticsDetailsOnly,
  fetchStaffAnalyticsOverview,
} from "@/lib/analytics/staff-analytics";
import { resolveAnalyticsDateRange } from "@/lib/analytics/date-range";

type Counter = {
  queryRaw: number;
  findMany: number;
};

function installQueryCounter(): Counter {
  const counter = { queryRaw: 0, findMany: 0 };
  const originalQueryRaw = prisma.$queryRaw.bind(prisma);
  const originalFindMany = prisma.appointment.findMany.bind(prisma.appointment);
  const originalEmployeeFindMany = prisma.employee.findMany.bind(prisma.employee);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (prisma as any).$queryRaw = async (...args: Parameters<typeof prisma.$queryRaw>) => {
    counter.queryRaw += 1;
    return originalQueryRaw(...args);
  };
  prisma.appointment.findMany = async (...args) => {
    counter.findMany += 1;
    return originalFindMany(...args);
  };
  prisma.employee.findMany = async (...args) => {
    counter.findMany += 1;
    return originalEmployeeFindMany(...args);
  };

  return counter;
}

function restoreQueryCounter() {
  // Re-import fresh client on next access; benchmark runs as one-shot script exit.
}

async function measureSection<T>(
  label: string,
  run: () => Promise<T>
): Promise<{ label: string; ms: number; queries: number; bytes: number }> {
  const counter = installQueryCounter();
  const start = performance.now();
  const result = await run();
  const ms = performance.now() - start;
  const queries = counter.queryRaw + counter.findMany;
  const bytes = Buffer.byteLength(JSON.stringify(result), "utf8");
  restoreQueryCounter();
  return { label, ms, queries, bytes };
}

async function main() {
  const salonId =
    process.argv[2] ??
    (
      await prisma.salon.findFirst({
        select: { id: true },
        orderBy: { createdAt: "asc" },
      })
    )?.id;

  if (!salonId) {
    console.error("No salon found. Pass salonId as first argument.");
    process.exit(1);
  }

  const employeeArg = process.argv[3];
  const employeeId =
    employeeArg && employeeArg !== "null" ? employeeArg : null;
  const range = resolveAnalyticsDateRange("this_month");
  const filters = { salonId, employeeId, range };

  console.log("Staff Analytics Benchmark");
  console.log("Salon:", salonId);
  console.log("Employee:", employeeId ?? "all");
  console.log("Period:", range.label);
  console.log("---");

  const overview = await measureSection("overview", () =>
    fetchStaffAnalyticsOverview(filters)
  );
  const charts = await measureSection("charts", () =>
    fetchStaffAnalyticsCharts(filters)
  );
  const details = await measureSection("details", async () => {
    const [overviewData, chartsData] = await Promise.all([
      fetchStaffAnalyticsOverview(filters),
      fetchStaffAnalyticsCharts(filters),
    ]);
    return fetchStaffAnalyticsDetailsOnly(filters, {
      overview: overviewData,
      charts: chartsData,
    });
  });
  const full = await measureSection("full", () => fetchStaffAnalytics(filters));

  for (const row of [overview, charts, details, full]) {
    console.log(
      `${row.label.padEnd(10)} ${row.queries.toString().padStart(3)} queries  ${row.ms.toFixed(0).padStart(5)} ms  ${(row.bytes / 1024).toFixed(1).padStart(6)} KB`
    );
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
