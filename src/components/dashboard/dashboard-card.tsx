"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
};

export function DashboardCard({
  children,
  className,
  delay = 0,
  hover = true,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={hover ? { scale: 1.02 } : undefined}
      className={cn(
        "min-w-0 max-w-full rounded-2xl border-0 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)]",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
