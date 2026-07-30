"use client";

import { motion } from "framer-motion";
import { FLOATING_CARDS } from "../constants";

const POSITIONS = [
  { top: "5%", left: "-8%", delay: 0 },
  { top: "15%", right: "-10%", delay: 0.2 },
  { top: "35%", left: "-12%", delay: 0.4 },
  { top: "55%", right: "-8%", delay: 0.6 },
  { top: "70%", left: "-5%", delay: 0.8 },
  { top: "80%", right: "-12%", delay: 1.0 },
  { top: "25%", right: "-15%", delay: 0.3 },
  { top: "45%", left: "-15%", delay: 0.5 },
  { top: "60%", right: "-14%", delay: 0.7 },
  { top: "10%", left: "5%", delay: 0.1 },
  { top: "85%", right: "5%", delay: 0.9 },
];

export function FloatingCards() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      {FLOATING_CARDS.map((card, i) => {
        const pos = POSITIONS[i % POSITIONS.length];
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + (pos.delay ?? 0), duration: 0.5 }}
            className="absolute"
            style={{
              top: pos.top,
              left: pos.left,
              right: pos.right,
            }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
              className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/90 px-3 py-2 shadow-lg shadow-violet-500/10 backdrop-blur-sm"
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${card.color}`}
              >
                <Icon className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-medium text-gray-500">{card.label}</div>
                <div className="text-xs font-bold text-gray-900">{card.value}</div>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
