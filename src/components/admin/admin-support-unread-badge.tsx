"use client";

import { useEffect, useState } from "react";
import { getAdminSupportUnreadCount } from "@/actions/support-chat";
import { cn } from "@/lib/utils";

export function AdminSupportUnreadBadge({
  initialCount,
  className,
}: {
  initialCount: number;
  className?: string;
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const next = await getAdminSupportUnreadCount();
        if (!cancelled) setCount(next);
      } catch {
        // Ignore polling errors in the sidebar badge.
      }
    }

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-dashboard-primary px-1.5 text-[10px] font-semibold text-white",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
