import { format, subDays } from "date-fns";
import { getAppointmentsByPeriod } from "@/actions/reports";
import { AppointmentsByPeriodClient } from "./appointments-by-period-client";

export default async function AppointmentsByPeriodPage({
  searchParams,
}: {
  searchParams: Promise<{
    dateFrom?: string;
    dateTo?: string;
    groupBy?: string;
  }>;
}) {
  const params = await searchParams;
  const dateTo = params.dateTo ?? format(new Date(), "yyyy-MM-dd");
  const dateFrom =
    params.dateFrom ?? format(subDays(new Date(), 30), "yyyy-MM-dd");
  const groupBy = params.groupBy === "weekly" ? "weekly" : "daily";

  const data = await getAppointmentsByPeriod(dateFrom, dateTo, groupBy);

  return (
    <AppointmentsByPeriodClient
      rows={data.rows}
      totalAppointments={data.totalAppointments}
      dateFrom={dateFrom}
      dateTo={dateTo}
      groupBy={groupBy}
    />
  );
}
