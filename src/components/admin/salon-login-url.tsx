"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSalonPublicUrl, salonLoginPath } from "@/lib/salon-paths";

type SalonLoginUrlProps = {
  slug: string;
  /** "compact" shows /{slug}/login; "full" shows the complete public URL */
  variant?: "compact" | "full";
};

export function SalonLoginUrl({ slug, variant = "compact" }: SalonLoginUrlProps) {
  const [copied, setCopied] = useState(false);
  const url = getSalonPublicUrl(slug, "/login");
  const path = salonLoginPath(slug);
  const label = variant === "full" ? url : path;

  async function copyUrl() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex min-w-0 items-center gap-1">
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate text-xs text-violet-600 hover:underline"
        title={url}
      >
        {label}
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 text-slate-500 hover:text-slate-700"
        onClick={copyUrl}
        title="Copy full login URL"
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-600" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
