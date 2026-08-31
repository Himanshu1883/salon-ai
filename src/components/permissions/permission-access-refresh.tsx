"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getMyAccessSignatureAction } from "@/actions/my-access";

const POLL_MS = 8_000;

/**
 * When an admin changes this staff member's permissions, refresh the dashboard
 * layout so sidebar and page gates update without a hard reload.
 */
export function PermissionAccessRefresh({
  signature,
  enabled,
}: {
  signature: string;
  enabled: boolean;
}) {
  const router = useRouter();
  const signatureRef = useRef(signature);

  useEffect(() => {
    signatureRef.current = signature;
  }, [signature]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let inFlight = false;

    async function sync() {
      if (inFlight || document.visibilityState === "hidden") return;
      inFlight = true;
      try {
        const next = await getMyAccessSignatureAction();
        if (cancelled || !next) return;
        if (next !== signatureRef.current) {
          router.refresh();
        }
      } catch {
        // Stay on the current layout; the next poll retries.
      } finally {
        inFlight = false;
      }
    }

    void sync();
    const intervalId = window.setInterval(() => {
      void sync();
    }, POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [enabled, router]);

  return null;
}
