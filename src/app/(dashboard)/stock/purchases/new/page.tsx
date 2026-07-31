import { redirect } from "next/navigation";

export default async function StockPurchaseRedirect({
  searchParams,
}: {
  searchParams: Promise<{ itemId?: string }>;
}) {
  const { itemId } = await searchParams;
  const query = itemId ? `?itemId=${itemId}` : "";
  redirect(`/inventory/stock/purchases/new${query}`);
}
