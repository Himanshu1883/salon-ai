"use client";

import { useEffect, useState } from "react";
import { getSalonPublicUrl, salonLoginPath } from "@/lib/salon-paths";

/** Relative path and full login URL; full URL uses window.location.origin on the client. */
export function useSalonLoginUrl(slug: string) {
  const path = salonLoginPath(slug);
  const [fullUrl, setFullUrl] = useState(() => getSalonPublicUrl(slug, "/login"));

  useEffect(() => {
    setFullUrl(getSalonPublicUrl(slug, "/login", window.location.origin));
  }, [slug]);

  return { path, fullUrl };
}
