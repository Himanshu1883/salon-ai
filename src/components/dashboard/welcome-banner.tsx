"use client";

import { useSearchParams } from "next/navigation";
import { X, Sparkles } from "lucide-react";
import { useState } from "react";

export function WelcomeBanner() {
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome") === "1";
  const name = searchParams.get("name");
  const [dismissed, setDismissed] = useState(false);

  if (!welcome || dismissed) return null;

  const displayName = name ? decodeURIComponent(name) : "your salon";

  return (
    <div className="mb-2 flex items-start gap-3 rounded-[20px] border border-violet-100 bg-violet-50/60 p-3 shadow-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-violet-600 text-white">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-violet-900">
          Welcome to Salon AI, {displayName}!
        </p>
        <p className="mt-0.5 text-xs text-violet-700/80">
          Your salon is ready. Start by checking in a customer or exploring your
          dashboard.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="rounded-md p-1 text-violet-600 hover:bg-violet-100"
        aria-label="Dismiss welcome message"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
