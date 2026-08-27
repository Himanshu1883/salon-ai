import { cn } from "@/lib/utils";
import { getSalonLogoUrl } from "@/lib/salon-logo";

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
  xs: "h-8 w-8 text-xs",
  sm: "h-10 w-10 text-sm",
  md: "h-11 w-11 text-lg",
  lg: "h-14 w-14 text-xl",
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
  const sizeClass = SIZE_CLASSES[size];
  const radiusClass = shape === "circle" ? "rounded-full" : "rounded-xl";

  if (publicUrl) {
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
        <img src={publicUrl} alt={alt} className="h-full w-full object-cover" />
      </div>
    );
  }

  const initial = fallbackInitial.charAt(0).toUpperCase() || "S";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br from-violet-400 to-fuchsia-500 font-bold text-white shadow-lg shadow-violet-900/40",
        sizeClass,
        radiusClass,
        className
      )}
    >
      {initial}
    </div>
  );
}
