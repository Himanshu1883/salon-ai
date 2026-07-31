import { getSeats, getSalonConfig } from "@/actions/seats";
import { getSeatEarnings } from "@/actions/billing";
import { SeatsClient } from "./seats-client";

export default async function SeatsPage() {
  const [seats, config, seatEarnings] = await Promise.all([
    getSeats(),
    getSalonConfig(),
    getSeatEarnings(),
  ]);

  const earningsMap = Object.fromEntries(
    seatEarnings.map((s) => [s.id, s])
  );

  return (
    <SeatsClient
      seats={seats.map((s) => ({
        ...s,
        earnings: earningsMap[s.id] ?? {
          totalRevenue: 0,
          paidInvoiceCount: 0,
        },
      }))}
      totalSeats={config?.totalSeats ?? seats.length}
    />
  );
}
