import { notFound } from "next/navigation";
import { getStockItem } from "@/actions/stock";
import { StockDetailClient } from "@/app/(dashboard)/stock/[id]/stock-detail-client";

export default async function InventoryStockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getStockItem(id);

  if (!item) notFound();

  return <StockDetailClient item={item} />;
}
