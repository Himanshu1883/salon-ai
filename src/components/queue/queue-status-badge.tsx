"use client";

import { cn } from "@/lib/utils";
import { STATUS_STYLES } from "./queue-utils";

export function QueueStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? {
    badge: "bg-stone-100 text-stone-600 ring-stone-200/60",
    dot: "bg-stone-400",
    label: status.replace("_", " "),
  };

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold capitalize ring-1 ring-inset sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs",
        style.badge
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}
