import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  size?: "nav" | "footer";
  priority?: boolean;
};

const SIZES = {
  nav: { className: "h-9 w-9 sm:h-10 sm:w-10", width: 80, height: 80 },
  footer: { className: "h-14 w-14 sm:h-16 sm:w-16", width: 120, height: 120 },
} as const;

export function BrandLogo({ className, size = "nav", priority }: BrandLogoProps) {
  const config = SIZES[size];

  return (
    <Image
      src="/logo.jpeg"
      alt=""
      width={config.width}
      height={config.height}
      priority={priority ?? size === "nav"}
      className={cn("rounded-lg object-cover object-center", config.className, className)}
      aria-hidden
    />
  );
}

type BrandMarkProps = {
  className?: string;
  size?: "nav" | "footer";
  priority?: boolean;
};

export function BrandMark({ className, size = "nav", priority }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandLogo size={size} priority={priority} />
      <span
        className={cn(
          "landing-display font-semibold leading-none tracking-tight",
          size === "nav"
            ? "text-lg text-[#1B1714] sm:text-xl"
            : "text-xl text-white sm:text-2xl"
        )}
      >
        Salon AI
      </span>
    </div>
  );
}
