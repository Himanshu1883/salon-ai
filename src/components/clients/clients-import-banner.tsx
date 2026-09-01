"use client";

import { Sparkles, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type ClientsImportBannerProps = {
  onStartImport: () => void;
  importProgress?: number | null;
};

const IMPORT_SOURCES = [
  { label: "CSV", enabled: true },
  { label: "Excel", enabled: false },
  { label: "Google Contacts", enabled: false },
  { label: "Phone", enabled: false },
  { label: "AI Duplicate Detection", enabled: false },
];

export function ClientsImportBanner({
  onStartImport,
  importProgress,
}: ClientsImportBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-xl bg-gradient-to-r from-[#6C3BFF] via-[#8B5CF6] to-[#6C3BFF] p-3 text-white shadow-[0_8px_32px_rgba(108,59,255,0.25)] sm:rounded-[20px] sm:p-5"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm sm:h-12 sm:w-12 sm:rounded-2xl">
            <Upload className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold sm:text-lg">Import your client list</p>
            <p className="mt-0.5 text-[11px] leading-snug text-white/80 sm:text-sm">
              Upload CSV to add clients. Duplicate detection keeps the list clean.
            </p>
            <div className="mt-2 hidden flex-wrap gap-1.5 sm:mt-3 sm:flex sm:gap-2">
              {IMPORT_SOURCES.map((source) => (
                <span
                  key={source.label}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium sm:px-3 sm:py-1 sm:text-xs ${
                    source.enabled
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {source.label}
                  {!source.enabled && " · soon"}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-row flex-wrap items-center gap-2">
          {importProgress != null && importProgress > 0 && (
            <div className="min-w-[140px] rounded-xl bg-white/15 px-3 py-2">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span>Importing…</span>
                <span>{importProgress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full origin-left rounded-full bg-white transition-transform duration-300"
                  style={{ transform: `scaleX(${importProgress / 100})` }}
                />
              </div>
            </div>
          )}
          <Button
            size="sm"
            className="h-8 rounded-xl bg-white px-2.5 text-xs text-[#6C3BFF] hover:bg-white/90 sm:h-9 sm:text-sm"
            onClick={onStartImport}
          >
            <Upload className="h-4 w-4" />
            Start import
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-xl border-white/40 bg-transparent px-2.5 text-xs text-white hover:bg-white/10 sm:h-9 sm:text-sm"
            onClick={onStartImport}
          >
            <Sparkles className="h-4 w-4" />
            Learn more
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
