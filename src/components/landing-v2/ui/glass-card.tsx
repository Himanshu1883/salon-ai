"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
};

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  const Comp = hover ? motion.div : "div";
  const motionProps = hover
    ? {
        whileHover: { y: -4, boxShadow: "0 20px 60px rgba(124,58,237,0.12)" },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <Comp
      {...motionProps}
      className={cn(
        "rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-violet-500/5 backdrop-blur-xl",
        hover && "cursor-default transition-shadow",
        className
      )}
    >
      {children}
    </Comp>
  );
}
