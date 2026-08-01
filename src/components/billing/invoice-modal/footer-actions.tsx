"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { invoiceModalStyles } from "./styles";

type FooterActionsProps = {
  step: 1 | 2;
  loading?: boolean;
  onCancel: () => void;
  onCreateInvoice?: () => void;
  onBack?: () => void;
  onSaveDraft?: () => void;
  onReceivePayment?: () => void;
  disableReceive?: boolean;
};

export function FooterActions({
  step,
  loading = false,
  onCancel,
  onCreateInvoice,
  onBack,
  onSaveDraft,
  onReceivePayment,
  disableReceive = false,
}: FooterActionsProps) {
  return (
    <div className="sticky bottom-0 shrink-0 border-t border-violet-100/60 bg-white/95 px-8 py-5 backdrop-blur-sm sm:px-10">
      <div className="flex items-center justify-between gap-3">
        {step === 1 ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className={invoiceModalStyles.outlineButton}
            >
              Cancel
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                onClick={onCreateInvoice}
                disabled={loading}
                className={cn(invoiceModalStyles.primaryButton, "min-w-[180px]")}
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
                      Creating...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      Create Invoice
                      <ArrowRight className="h-4 w-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={loading}
              className={invoiceModalStyles.outlineButton}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={loading}
                className={invoiceModalStyles.outlineButton}
              >
                Save Draft
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  onClick={onReceivePayment}
                  disabled={loading || disableReceive}
                  className={cn(
                    invoiceModalStyles.primaryButton,
                    "min-w-[220px]",
                    disableReceive && "opacity-60"
                  )}
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
                        Processing...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Receive Payment & Complete
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
