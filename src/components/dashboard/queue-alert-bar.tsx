import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

type QueueAlertBarProps = {
  waitingCount: number;
  estimatedWait?: number;
};

export function QueueAlertBar({
  waitingCount,
  estimatedWait,
}: QueueAlertBarProps) {
  if (waitingCount <= 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 shrink-0 text-orange-600" />
        <p className="text-sm text-orange-950">
          <span className="font-semibold">{waitingCount} waiting</span>
          {estimatedWait !== undefined && (
            <>
              {" · "}
              Est. wait for walk-ins:{" "}
              <span className="font-semibold">{estimatedWait} min</span>
            </>
          )}
        </p>
      </div>
      <Button
        asChild
        size="sm"
        className="shrink-0 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
      >
        <Link href="/queue">View Queue</Link>
      </Button>
    </div>
  );
}
