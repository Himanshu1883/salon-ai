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
  /** Hide primary CTA when summary panel owns checkout on desktop */
  hidePrimary?: boolean;
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
  hidePrimary = false,
}: ModalFooterProps) {
  const primaryLabel = continueLabel ?? (step === 1 ? "Continue" : "Complete Payment");
  const primaryShort = step === 1 ? "Continue" : "Complete";

  return (
    <footer className={v3.footer}>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex items-center justify-between gap-2 sm:justify-start">
          {step === 2 && onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className={cn(v3.ghostButton, "px-2 sm:px-3.5")}
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              <span className="sr-only sm:not-sr-only sm:inline">Back</span>
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={cn(v3.ghostButton, "hidden sm:inline-flex")}
          >
            Cancel
          </button>
          {showSaveDraft && onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={loading}
              className={cn(v3.outlineButton, "hidden md:inline-flex")}
            >
              Save Draft
            </button>
          )}
        </div>

        {!hidePrimary && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className={cn(v3.ghostButton, "flex-1 sm:hidden")}
            >
              Cancel
            </button>
            {showSaveDraft && onSaveDraft && (
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={loading}
                className={cn(v3.outlineButton, "flex-1 md:hidden")}
              >
                Draft
              </button>
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              disabled={loading || disableContinue}
              className={cn(v3.primaryButton, "min-w-0 flex-1 sm:min-w-[120px] sm:flex-none")}
            >
              <AnimatePresence mode="wait" initial={false}>
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-1.5"
                  >
                    <Loader2 className="h-4 w-4 animate-spin sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">
                      {step === 1 ? "Creating…" : "Processing…"}
                    </span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-1.5"
                  >
                    <span className="sm:hidden">{primaryShort}</span>
                    <span className="hidden sm:inline">{primaryLabel}</span>
                    <ArrowRight className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        )}
      </div>
    </footer>
  );
}
