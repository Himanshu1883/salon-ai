import { Suspense } from "react";
import { requireSession } from "@/lib/auth";
import { getQueueOverview } from "@/actions/queue-overview";
import { QueueClient } from "./queue-client";
import { QueueLoadingSkeleton } from "@/components/dashboard/loading-skeletons";

async function QueuePageContent() {
  await requireSession();
  const overview = await getQueueOverview();
  return <QueueClient overview={overview} />;
}

export default function QueuePage() {
  return (
    <Suspense fallback={<QueueLoadingSkeleton />}>
      <QueuePageContent />
    </Suspense>
  );
}
