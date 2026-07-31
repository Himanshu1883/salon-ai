"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import {
  Star,
  CalendarClock,
  Share2,
  FileBarChart,
  IndianRupee,
  Wallet,
  Calendar,
  Users,
  UserCircle,
  Package,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleReportFavorite } from "@/actions/reports";
import type { ReportCatalogItem } from "@/actions/reports";
import type { ReportCategory } from "@/lib/reports-catalog";
import { Button } from "@/components/ui/button";

const CATEGORY_ICONS: Record<ReportCategory, LucideIcon> = {
  sales: IndianRupee,
  finance: Wallet,
  appointments: Calendar,
  team: Users,
  clients: UserCircle,
  inventory: Package,
};

const CATEGORY_COLORS: Record<ReportCategory, { bg: string; stroke: string }> = {
  sales: { bg: "bg-violet-50", stroke: "#6C3BFF" },
  finance: { bg: "bg-emerald-50", stroke: "#10B981" },
  appointments: { bg: "bg-rose-50", stroke: "#F43F5E" },
  team: { bg: "bg-indigo-50", stroke: "#6366F1" },
  clients: { bg: "bg-sky-50", stroke: "#0EA5E9" },
  inventory: { bg: "bg-amber-50", stroke: "#F59E0B" },
};

function slugSparkline(slug: string): { v: number }[] {
  let seed = 0;
  for (let i = 0; i < slug.length; i++) seed += slug.charCodeAt(i);
  return Array.from({ length: 7 }, (_, i) => ({
    v: 20 + ((seed * (i + 1)) % 80),
  }));
}

export function ReportBiCard({ report }: { report: ReportCatalogItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [favorited, setFavorited] = useState(report.isFavorited);

  const Icon = CATEGORY_ICONS[report.category] ?? Tag;
  const colors = CATEGORY_COLORS[report.category];
  const sparkData = slugSparkline(report.slug);

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleReportFavorite(report.slug);
      if (result.success) {
        setFavorited(result.favorited ?? false);
        router.refresh();
      }
    });
  }

  function handleAction(e: React.MouseEvent, action: "generate" | "schedule" | "share") {
    e.preventDefault();
    e.stopPropagation();
    if (action === "generate") {
      router.push(report.route);
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group h-full"
    >
      <Link
        href={report.route}
        className="flex h-full flex-col rounded-2xl border border-[#E8ECF4] bg-white p-4 shadow-[0_2px_12px_rgba(28,16,61,0.04)] transition-shadow hover:border-[#6C3BFF]/20 hover:shadow-[0_8px_24px_rgba(108,59,255,0.1)]"
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              colors.bg
            )}
          >
            <Icon className="h-5 w-5" style={{ color: colors.stroke }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-[#1C103D] group-hover:text-[#6C3BFF]">
                {report.name}
              </h3>
              <button
                type="button"
                onClick={handleFavorite}
                disabled={isPending}
                className="shrink-0 rounded-lg p-1 text-[#9CA3AF] transition-colors hover:bg-[#F7F8FC] hover:text-amber-500"
                aria-label={favorited ? "Remove from favourites" : "Add to favourites"}
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    favorited && "fill-amber-400 text-amber-400"
                  )}
                />
              </button>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-[#6B7280]">
              {report.description}
            </p>
          </div>
        </div>

        <div className="mt-3 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`card-${report.slug}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={colors.stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={colors.stroke}
                strokeWidth={1.5}
                fill={`url(#card-${report.slug})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-[#9CA3AF]">
          <span>Created by {report.createdBy}</span>
          {report.isPremium && (
            <span className="rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[10px] font-semibold text-[#6C3BFF]">
              Premium
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="outline"
            size="sm"
            className="h-7 flex-1 rounded-lg border-[#E8ECF4] px-2 text-xs"
            onClick={(e) => handleAction(e, "generate")}
          >
            <FileBarChart className="mr-1 h-3 w-3" />
            Generate
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Coming soon"
            className="h-7 rounded-lg border-[#E8ECF4] px-2 text-xs opacity-60"
            onClick={(e) => handleAction(e, "schedule")}
          >
            <CalendarClock className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Coming soon"
            className="h-7 rounded-lg border-[#E8ECF4] px-2 text-xs opacity-60"
            onClick={(e) => handleAction(e, "share")}
          >
            <Share2 className="h-3 w-3" />
          </Button>
        </div>
      </Link>
    </motion.div>
  );
}
