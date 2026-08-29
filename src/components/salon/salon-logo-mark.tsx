"use client";

import { useEffect, useState } from "react";
import { cn, getInitials } from "@/lib/utils";
import { getSalonLogoUrl } from "@/lib/salon-logo";

function logoInitials(name: string) {
  const fromWords = getInitials(name);
  if (fromWords.length >= 2) return fromWords;
  const compact = name.replace(/[^a-zA-Z0-9]+/g, "");
  if (compact.length >= 2) return compact.slice(0, 2).toUpperCase();
  return (fromWords || compact || "S").toUpperCase();
}

type SalonLogoMarkProps = {
  logoUrl: string | null | undefined;
  fallbackInitial?: string;
  size?: "xs" | "sm" | "md" | "lg";
  shape?: "circle" | "rounded";
  variant?: "light" | "dark";
  className?: string;
  alt?: string;
};

const SIZE_CLASSES = {
  xs: "h-8 w-8 text-[11px]",
  sm: "h-10 w-10 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

export function SalonLogoMark({
  logoUrl,
  fallbackInitial = "S",
  size = "md",
  shape = "circle",
  variant = "light",
  className,
  alt = "",
}: SalonLogoMarkProps) {
  const publicUrl = getSalonLogoUrl(logoUrl);
  const [failed, setFailed] = useState(false);
  const initials = logoInitials(fallbackInitial);
  const sizeClass = SIZE_CLASSES[size];
  const radiusClass = shape === "circle" ? "rounded-full" : "rounded-xl";
  const showImage = Boolean(publicUrl) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [publicUrl]);

  if (showImage) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden ring-1",
          sizeClass,
          radiusClass,
          variant === "light"
            ? "bg-white/10 ring-white/20"
            : "bg-white ring-stone-200",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={publicUrl!}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br from-violet-400 to-fuchsia-500 font-bold uppercase tracking-wide text-white shadow-lg shadow-violet-900/40",
        sizeClass,
        radiusClass,
        className
      )}
      aria-hidden={alt ? undefined : true}
      aria-label={alt || undefined}
    >
      {initials}
    </div>
  );
}
