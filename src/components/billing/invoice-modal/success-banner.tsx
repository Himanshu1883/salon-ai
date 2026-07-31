"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

type SuccessBannerProps = {
  invoiceNumber: string;
};

export function SuccessBanner({ invoiceNumber }: SuccessBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-[14px] border border-[#22C55E]/20 bg-[#22C55E]/10 px-4 py-3"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
      >
        <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
      </motion.div>
      <p className="text-sm font-medium text-[#166534]">
        Invoice created successfully!{" "}
        <span className="font-semibold">Invoice #{invoiceNumber}</span>
      </p>
    </motion.div>
  );
}
