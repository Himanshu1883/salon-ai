"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAllowedPathWhenBlocked } from "@/lib/subscription";

export function AccessGate({
  blocked,
  children,
}: {
  blocked: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!blocked) return;
    if (isAllowedPathWhenBlocked(pathname)) return;
    router.replace("/invoice-due");
  }, [blocked, pathname, router]);

  if (blocked && !isAllowedPathWhenBlocked(pathname)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-stone-500">Redirecting to subscription invoice…</p>
      </div>
    );
  }

  return <>{children}</>;
}
