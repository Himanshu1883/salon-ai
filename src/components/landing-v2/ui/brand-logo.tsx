import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  size?: "nav" | "footer";
  priority?: boolean;
};

const SIZES = {
  nav: { className: "h-9 w-auto sm:h-10", width: 120, height: 120 },
  footer: { className: "h-[4.5rem] w-auto sm:h-24", width: 200, height: 200 },
} as const;

export function BrandLogo({ className, size = "nav", priority }: BrandLogoProps) {
  const config = SIZES[size];

  return (
    <Image
      src="/logo.png"
      alt="Salon AI"
      width={config.width}
      height={config.height}
      priority={priority ?? size === "nav"}
      className={cn("object-contain object-left", config.className, className)}
    />
  );
}
