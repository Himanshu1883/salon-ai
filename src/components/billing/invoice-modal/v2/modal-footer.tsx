"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { v2 } from "./tokens";

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
  const primaryLabel =
    continueLabel ?? (step === 1 ? "Continue" : "Receive Payment & Complete");

  return (
    <footer className={v2.footer}>
      <div className="flex items-center justify-between gap-4">
        {step === 1 ? (
          <>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className={v2.ghostButton}
              >
                Cancel
              </button>
              {showSaveDraft && onSaveDraft && (
                <button
                  type="button"
                  onClick={onSaveDraft}
                  disabled={loading}
                  className={v2.outlineButton}
                >
                  Save Draft
                </button>
              )}
            </div>
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              disabled={loading || disableContinue}
              className={cn(v2.primaryButton, "min-w-[160px]")}
            >
              <AnimatePresence mode="wait" initial={false}>
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    {primaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className={v2.outlineButton}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className={v2.ghostButton}
              >
                Cancel
              </button>
              {onSaveDraft && (
                <button
                  type="button"
                  onClick={onSaveDraft}
                  disabled={loading}
                  className={v2.outlineButton}
                >
                  Save Draft
                </button>
              )}
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onContinue}
                disabled={loading || disableContinue}
                className={cn(v2.primaryButton, "min-w-[220px]")}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing…
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      {primaryLabel}
                      <ArrowRight className="h-4 w-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </>
        )}
      </div>
    </footer>
  );
}
