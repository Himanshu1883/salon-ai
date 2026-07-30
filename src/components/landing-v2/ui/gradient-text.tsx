import { cn } from "@/lib/utils";

type GradientTextProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "emerald" | "purple" | "rose";
};

const variants = {
  emerald: "from-emerald-400 via-emerald-500 to-teal-400",
  purple: "from-purple-400 via-violet-500 to-purple-600",
  rose: "from-rose-300 via-amber-200 to-rose-400",
};

export function GradientText({ children, className, variant = "emerald" }: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
