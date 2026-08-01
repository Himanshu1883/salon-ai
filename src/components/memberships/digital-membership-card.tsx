"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Crown, Download, Share2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { getInitials } from "@/lib/utils";
import { format } from "date-fns";
import { MEMBERSHIP_GOLD } from "@/lib/memberships/constants";

type DigitalCardProps = {
  customerName: string;
  planName: string;
  membershipNumber: string;
  themeColor: string;
  endDate: Date;
  benefits: string[];
  discountPercent?: number;
};

export function DigitalMembershipCard({
  customerName,
  planName,
  membershipNumber,
  themeColor,
  endDate,
  benefits,
  discountPercent,
}: DigitalCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleShare() {
    if (navigator.share) {
      void navigator.share({
        title: `${planName} Membership — Glow Desk`,
        text: `Membership #${membershipNumber} for ${customerName}`,
      });
    }
  }

  return (
    <div className="space-y-4">
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mx-auto max-w-sm overflow-hidden rounded-3xl shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 50%, #1a1a2e 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                Glow Desk
              </p>
              <p className="mt-1 text-xl font-bold">{planName}</p>
            </div>
            <Crown className="h-6 w-6" style={{ color: MEMBERSHIP_GOLD }} />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold backdrop-blur-sm">
              {getInitials(customerName)}
            </div>
            <div>
              <p className="font-semibold">{customerName}</p>
              <p className="text-xs text-white/70">#{membershipNumber}</p>
            </div>
          </div>

          {discountPercent != null && discountPercent > 0 && (
            <div className="mt-4 inline-flex rounded-lg bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              {discountPercent}% off all services
            </div>
          )}

          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/60">Valid until</p>
              <p className="text-sm font-medium">{format(new Date(endDate), "MMM d, yyyy")}</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white p-1">
              <QrCode className="h-full w-full text-stone-900" />
            </div>
          </div>
        </div>
      </motion.div>

      {benefits.length > 0 && (
        <ul className="mx-auto max-w-sm space-y-1.5 text-sm text-stone-600 dark:text-stone-300">
          {benefits.slice(0, 4).map((b) => (
            <li key={b} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {b}
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-emerald-200"
          onClick={handleShare}
        >
          <Share2 className="mr-1.5 h-4 w-4" />
          Share
        </Button>
        <Button
          size="sm"
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
          onClick={() => window.print()}
        >
          <Download className="mr-1.5 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}

export function DigitalMembershipCardInline({
  planName,
  membershipNumber,
  themeColor,
  endDate,
}: {
  planName: string;
  membershipNumber: string;
  themeColor: string;
  endDate: Date;
}) {
  return (
    <div
      className="rounded-2xl p-4 text-white shadow-md"
      style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}99)` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/70">Active membership</p>
          <p className="font-bold">{planName}</p>
          <p className="text-xs text-white/80">#{membershipNumber}</p>
        </div>
        <div className="text-right text-xs">
          <p className="text-white/70">Expires</p>
          <p className="font-medium">{format(new Date(endDate), "MMM d, yyyy")}</p>
        </div>
      </div>
    </div>
  );
}
