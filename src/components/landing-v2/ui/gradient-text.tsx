import { cn } from "@/lib/utils";

type GradientTextProps = {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "h1" | "h2" | "p";
};

export function GradientText({
  children,
  className,
  as: Tag = "span",
}: GradientTextProps) {
  return (
    <Tag
      className={cn(
        "bg-gradient-to-r from-violet-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </Tag>
  );
}
