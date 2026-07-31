import { notFound } from "next/navigation";
import { getCustomerStats } from "@/actions/customers";
import { CustomerDetailClient } from "@/app/(dashboard)/customers/[id]/customer-detail-client";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stats = await getCustomerStats(id);

  if (!stats) notFound();

  return <CustomerDetailClient stats={stats} />;
}
