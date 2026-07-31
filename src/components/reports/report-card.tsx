"use client";

import Link from "next/link";
import { Star, Tag, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleReportFavorite } from "@/actions/reports";
import type { ReportCatalogItem } from "@/actions/reports";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function ReportCard({ report }: { report: ReportCatalogItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [favorited, setFavorited] = useState(report.isFavorited);

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

  const Icon = report.category === "sales" ? IndianRupee : Tag;

  return (
    <Link
      href={report.route}
      className="group block rounded-xl border border-stone-700 bg-stone-800 p-4 transition-colors hover:border-violet-500 hover:bg-stone-750"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-700 text-stone-300">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-stone-100 group-hover:text-white">
              {report.name}
            </h3>
            <button
              type="button"
              onClick={handleFavorite}
              disabled={isPending}
              className="shrink-0 rounded p-1 text-stone-400 transition-colors hover:text-amber-400"
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
          <p className="mt-1 line-clamp-2 text-sm text-stone-400">
            {report.description}
          </p>
          {report.isPremium && (
            <span className="mt-2 inline-flex rounded-full bg-violet-600/20 px-2 py-0.5 text-xs font-medium text-violet-300">
              Premium
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
