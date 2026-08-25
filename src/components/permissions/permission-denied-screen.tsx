"use client";

import { ShieldOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PermissionDeniedScreen({
  featureName = "This page",
  backHref = "/dashboard",
}: {
  featureName?: string;
  backHref?: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
        <ShieldOff className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-dashboard-text">
        Access denied
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-500">
        You don&apos;t have permission to access {featureName.toLowerCase()}.
        Contact your salon owner or manager if you need access.
      </p>
      <Button asChild className="mt-8">
        <Link href={backHref}>Back to dashboard</Link>
      </Button>
    </div>
  );
}
