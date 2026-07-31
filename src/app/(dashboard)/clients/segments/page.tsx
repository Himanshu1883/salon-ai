import { getAllSegments } from "@/actions/segments";
import { SegmentsClient } from "@/app/(dashboard)/customers/segments/segments-client";

export default async function ClientSegmentsPage() {
  const { standard, custom, totalCount } = await getAllSegments();
  return (
    <SegmentsClient
      standardSegments={standard}
      customSegments={custom}
      totalCount={totalCount}
    />
  );
}
