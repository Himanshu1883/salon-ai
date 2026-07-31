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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset",
        style.badge
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}
