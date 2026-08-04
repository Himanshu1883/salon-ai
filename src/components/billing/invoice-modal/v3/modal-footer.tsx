"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { v3 } from "./tokens";

type ModalFooterProps = {
  step: 1 | 2;
  loading?: boolean;
  onCancel: () => void;
  onContinue?: () => void;
  onBack?: () => void;
  onSaveDraft?: () => void;
  continueLabel?: string;
  disableContinue?: boolean;
  showSaveDraft?: boolean;
};

export function ModalFooter({
  step,
  loading = false,
  onCancel,
  onContinue,
  onBack,
  onSaveDraft,
  continueLabel,
  disableContinue = false,
  showSaveDraft = false,
}: ModalFooterProps) {
  const primaryLabel = continueLabel ?? (step === 1 ? "Continue" : "Complete Payment");

  return (
    <footer className={v3.footer}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {step === 2 && onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className={cn(v3.ghostButton, "px-2")}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={v3.ghostButton}
          >
            Cancel
          </button>
          {showSaveDraft && onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={loading}
              className={v3.outlineButton}
            >
              Save Draft
            </button>
          )}
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          disabled={loading || disableContinue}
          className={cn(v3.primaryButton, "min-w-[120px]")}
        >
          <AnimatePresence mode="wait" initial={false}>
            {loading ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {step === 1 ? "Creating…" : "Processing…"}
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5"
              >
                {primaryLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </footer>
  );
}
