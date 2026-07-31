"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSalonLoginUrl } from "@/hooks/use-salon-login-url";
import { cn } from "@/lib/utils";

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

  if (variant === "full") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-dashboard-border bg-slate-50/80 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-dashboard-primary/10 text-dashboard-primary">
            <Link2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-dashboard-muted">
              Salon login URL
            </p>
            <Link
              href={path}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block truncate text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover hover:underline"
              title={fullUrl}
            >
              {fullUrl}
            </Link>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-dashboard-border"
            onClick={copyUrl}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-dashboard-success" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy URL
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="gap-2 rounded-xl bg-dashboard-primary hover:bg-dashboard-primary-hover"
            asChild
          >
            <Link href={path} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-1">
      <Link
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover hover:underline"
        title={fullUrl}
      >
        {label}
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7 shrink-0 text-dashboard-muted hover:bg-dashboard-primary/10 hover:text-dashboard-primary"
        )}
        onClick={copyUrl}
        title="Copy full login URL"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-dashboard-success" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
