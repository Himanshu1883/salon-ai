import { notFound } from "next/navigation";
import { getSegmentDetail, getSegmentCustomers } from "@/actions/segments";
import { SegmentDetailClient } from "@/app/(dashboard)/customers/segments/[id]/segment-detail-client";

export default async function ClientSegmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [segment, customers] = await Promise.all([
    getSegmentDetail(id),
    getSegmentCustomers(id),
  ]);

  if (!segment || customers === null) notFound();

  return <SegmentDetailClient segment={segment} customers={customers} />;
}
