"use client";

import { FLOATING_CARDS } from "../constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const colorMap = {
  emerald: "border-emerald-200/60 bg-emerald-50/90 text-emerald-700",
  purple: "border-purple-200/60 bg-purple-50/90 text-purple-700",
  rose: "border-rose-200/60 bg-rose-50/90 text-rose-700",
};

const positions = [
  { top: "5%", left: "-8%", delay: 0 },
  { top: "15%", right: "-5%", delay: 0.2 },
  { top: "45%", left: "-12%", delay: 0.4 },
  { top: "55%", right: "-10%", delay: 0.6 },
  { top: "75%", left: "-6%", delay: 0.8 },
  { top: "85%", right: "-8%", delay: 1.0 },
  { top: "30%", left: "85%", delay: 0.3 },
  { top: "65%", right: "82%", delay: 0.5 },
];

export function FloatingCards() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      {FLOATING_CARDS.map((card, i) => {
        const pos = positions[i];
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pos.delay + 0.5, duration: 0.6 }}
            className="absolute"
            style={{ top: pos.top, left: pos.left, right: pos.right }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "rounded-xl border px-3 py-2 shadow-lg backdrop-blur-md",
                colorMap[card.color]
              )}
            >
              <div className="text-[10px] font-medium opacity-70">{card.label}</div>
              <div className="text-sm font-bold">{card.value}</div>
              <div className="text-[10px] opacity-60">{card.trend}</div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
