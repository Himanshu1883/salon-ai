import { format, subDays } from "date-fns";
import { getGiftCardsByPeriod } from "@/actions/reports";
import { GiftCardsPeriodClient } from "./gift-cards-period-client";

export default async function GiftCardsPeriodPage({
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

  const data = await getGiftCardsByPeriod(dateFrom, dateTo, groupBy);

  return (
    <GiftCardsPeriodClient
      rows={data.rows}
      grandTotal={data.grandTotal}
      dateFrom={dateFrom}
      dateTo={dateTo}
      groupBy={groupBy}
    />
  );
}
