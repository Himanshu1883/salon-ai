"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSalonLoginUrl } from "@/hooks/use-salon-login-url";

type SalonLoginUrlProps = {
  slug: string;
  /** "compact" shows /{slug}/login; "full" shows the complete public URL */
  variant?: "compact" | "full";
};

export function SalonLoginUrl({ slug, variant = "compact" }: SalonLoginUrlProps) {
  const [copied, setCopied] = useState(false);
  const { path, fullUrl } = useSalonLoginUrl(slug);
  const label = variant === "full" ? fullUrl : path;

  async function copyUrl() {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex min-w-0 items-center gap-1">
      <Link
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate text-xs text-violet-600 hover:underline"
        title={fullUrl}
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
