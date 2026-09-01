"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DASHBOARD_ERROR_RETRY_KEY } from "@/components/dashboard/dashboard-session-keepalive";
import { isRetryableDbError } from "@/lib/db-errors";

const AUTO_RETRY_COOLDOWN_MS = 12_000;

function salonLoginHref(pathname: string | null) {
  const slug = pathname?.split("/").filter(Boolean)[0];
  if (slug && slug !== "login" && slug !== "admin" && slug !== "dashboard") {
    return `/${slug}/login`;
  }
  return "/login";
}

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const loginHref = useMemo(() => salonLoginHref(pathname), [pathname]);
  const [reconnecting, setReconnecting] = useState(() =>
    isRetryableDbError(error)
  );

  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  useEffect(() => {
    let cancelled = false;
    const lastRetryAt = Number(
      sessionStorage.getItem(DASHBOARD_ERROR_RETRY_KEY) || "0"
    );
    const recentlyRetried = Date.now() - lastRetryAt < AUTO_RETRY_COOLDOWN_MS;
    const shouldAutoRetry = isRetryableDbError(error) && !recentlyRetried;

    async function reconnect() {
      if (!shouldAutoRetry) {
        setReconnecting(false);
        return;
      }
      try {
        await fetch("/api/warm", {
          cache: "no-store",
          credentials: "same-origin",
        });
      } catch {
        // Reset still attempts a fresh render.
      }
      if (cancelled) return;
      sessionStorage.setItem(DASHBOARD_ERROR_RETRY_KEY, String(Date.now()));
      reset();
    }

    void reconnect();
    return () => {
      cancelled = true;
    };
  }, [error, reset]);

  if (reconnecting) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Reconnecting</CardTitle>
            <CardDescription>
              Refreshing your dashboard. You can stay signed in.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Couldn&apos;t load this page</CardTitle>
          <CardDescription>
            Your session is still active. Refresh to load the latest data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            onClick={() => {
              sessionStorage.removeItem(DASHBOARD_ERROR_RETRY_KEY);
              reset();
            }}
          >
            Refresh dashboard
          </Button>
          <Button variant="outline" asChild>
            <Link href={loginHref}>Go to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
