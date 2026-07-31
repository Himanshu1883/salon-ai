"use client";

import { useEffect, useState } from "react";

type HeaderData = {
  alertCount: number;
  showUpgrade: boolean;
};

type HeaderDataLoaderProps = {
  onData: (data: HeaderData) => void;
};

/** Fetches non-critical header badges via lightweight API route. */
export function HeaderDataLoader({ onData }: HeaderDataLoaderProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    let cancelled = false;

    fetch("/api/layout/alerts", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: HeaderData | null) => {
        if (!cancelled && data) {
          onData(data);
          setLoaded(true);
        }
      })
      .catch(() => {
        /* Header badges are non-critical */
      });

    return () => {
      cancelled = true;
    };
  }, [loaded, onData]);

  return null;
}
