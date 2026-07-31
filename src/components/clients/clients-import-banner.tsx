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
      className="overflow-hidden rounded-[20px] bg-gradient-to-r from-[#6C3BFF] via-[#8B5CF6] to-[#6C3BFF] p-5 text-white shadow-[0_8px_32px_rgba(108,59,255,0.25)]"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold">Import your client list</p>
            <p className="mt-0.5 text-sm text-white/80">
              Upload CSV, Excel, Google Contacts, or sync from phone. AI
              duplicate detection keeps your database clean.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {IMPORT_SOURCES.map((source) => (
                <span
                  key={source.label}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
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

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
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
            className="rounded-xl bg-white text-[#6C3BFF] hover:bg-white/90"
            onClick={onStartImport}
          >
            <Upload className="h-4 w-4" />
            Start import
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-white/40 bg-transparent text-white hover:bg-white/10"
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
