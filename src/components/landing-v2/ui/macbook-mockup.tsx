"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DashboardMockup } from "./dashboard-mockup";

type MacBookMockupProps = {
  className?: string;
};

export function MacBookMockup({ className }: MacBookMockupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className={cn("relative mx-auto w-full max-w-lg perspective-[1200px]", className)}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Glow behind */}
      <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-violet-500/20 via-purple-500/10 to-emerald-500/20 blur-3xl" />

      {/* Screen lid */}
      <div className="relative rounded-t-xl border border-gray-300/80 bg-gradient-to-b from-gray-200 to-gray-300 p-[3px] shadow-2xl shadow-violet-500/10">
        <div className="overflow-hidden rounded-t-[10px] bg-gray-900">
          {/* Camera notch area */}
          <div className="flex h-5 items-center justify-center bg-gray-800">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-600" />
          </div>
          {/* Screen content */}
          <div className="aspect-[16/10] bg-white">
            <DashboardMockup variant="default" className="h-full" />
          </div>
        </div>
      </div>

      {/* Hinge */}
      <div className="relative mx-auto h-3 w-[calc(100%+16px)] -translate-x-2 rounded-b-sm bg-gradient-to-b from-gray-300 to-gray-400" />

      {/* Base */}
      <div className="relative mx-auto h-3 w-[calc(100%+32px)] -translate-x-4 rounded-b-xl bg-gradient-to-b from-gray-300 via-gray-200 to-gray-300 shadow-lg">
        <div className="absolute inset-x-1/4 top-0 h-0.5 rounded-full bg-gray-400/50" />
      </div>
    </motion.div>
  );
}

type BrowserMockupProps = {
  children: React.ReactNode;
  url?: string;
  className?: string;
};

export function BrowserMockup({
  children,
  url = "app.salonai.com/dashboard",
  className,
}: BrowserMockupProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl shadow-violet-500/10",
        className
      )}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/80 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <div className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 rounded-lg bg-white px-4 py-1.5 text-center text-xs text-gray-400 shadow-inner">
          {url}
        </div>
      </div>
      <div className="bg-white">{children}</div>
    </div>
  );
}
