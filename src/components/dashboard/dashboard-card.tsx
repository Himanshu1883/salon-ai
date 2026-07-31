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
        "rounded-[20px] border border-dashboard-border bg-dashboard-card shadow-dashboard-card",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
