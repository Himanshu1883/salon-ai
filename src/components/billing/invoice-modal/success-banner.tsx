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
      className="flex items-center gap-3 rounded-2xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50/80 to-emerald-50/40 px-5 py-3.5 shadow-sm shadow-emerald-500/5"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
      >
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      </motion.div>
      <p className="text-sm font-medium text-emerald-800">
        Invoice created successfully!{" "}
        <span className="font-semibold">Invoice #{invoiceNumber}</span>
      </p>
    </motion.div>
  );
}
