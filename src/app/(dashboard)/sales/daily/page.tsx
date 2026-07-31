import { format } from "date-fns";
import { getDailySalesSummary } from "@/actions/daily-sales";
import { getServices } from "@/actions/services";
import { getActiveEmployees } from "@/actions/employees";
import { DailySalesClient } from "./daily-sales-client";

export default async function DailySalesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date = params.date ?? format(new Date(), "yyyy-MM-dd");

  const [summary, services, employees] = await Promise.all([
    getDailySalesSummary(date),
    getServices(),
    getActiveEmployees(),
  ]);

  return (
    <DailySalesClient
      summary={summary}
      services={services.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
      }))}
      employees={employees.map((e) => ({ id: e.id, name: e.name }))}
    />
  );
}
