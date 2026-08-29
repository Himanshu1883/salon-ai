"use client";

import { useEffect } from "react";

const KEEP_ALIVE_MS = 4 * 60 * 1000;
export const DASHBOARD_ERROR_RETRY_KEY = "gotix-dashboard-auto-retry";

async function pingSession() {
  try {
    await Promise.all([
      fetch("/api/warm", { cache: "no-store", credentials: "same-origin" }),
      fetch("/api/auth/session", {
        cache: "no-store",
        credentials: "same-origin",
      }),
    ]);
  } catch {
    // Next navigation or query retry will reconnect if this ping fails.
  }
}

/** Keeps the auth cookie and database pool alive while the dashboard is open. */
export function DashboardSessionKeepAlive() {
  useEffect(() => {
    sessionStorage.removeItem(DASHBOARD_ERROR_RETRY_KEY);
    void pingSession();

    const intervalId = window.setInterval(() => {
      void pingSession();
    }, KEEP_ALIVE_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void pingSession();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
