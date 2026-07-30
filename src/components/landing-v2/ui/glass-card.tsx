"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
};

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
