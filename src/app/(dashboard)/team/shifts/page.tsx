import { getWeekShiftGrid } from "@/actions/shifts";
import { getActiveEmployees } from "@/actions/employees";
import { getWeekStart, toDateKey } from "@/lib/team";
import { ShiftsClient } from "./shifts-client";

export default async function ShiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; employee?: string }>;
}) {
  const params = await searchParams;
  const weekStart = params.week
    ? getWeekStart(params.week)
    : getWeekStart(new Date());
  const weekKey = toDateKey(weekStart);

  const [grid, employees] = await Promise.all([
    getWeekShiftGrid(weekKey),
    getActiveEmployees(),
  ]);

  return (
    <ShiftsClient
      grid={grid}
      employees={employees.map((e) => ({ id: e.id, name: e.name }))}
    />
  );
}
