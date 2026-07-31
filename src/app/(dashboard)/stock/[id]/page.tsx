import { redirect } from "next/navigation";

export default async function StockDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/inventory/stock/${id}`);
}
