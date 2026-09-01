"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Search,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import {
  CheckInCard,
  CheckInCardContent,
  CheckInCardHeader,
} from "./check-in-card";
import { type CheckInService } from "./types";
import { getServiceIcon, getServiceIconColors } from "./utils";
import { visibleTopCategories } from "@/lib/queue/check-in-service-filters";

type CatalogService = CheckInService & { popular?: boolean };

type ServicesPagePayload = {
  services: CatalogService[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  categories: { id: string; name: string }[];
};

type ServiceSelectionProps = {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onCatalogUpdate?: (services: CheckInService[]) => void;
};

const PAGE_SIZE = 12;

export function ServiceSelection({
  selectedIds,
  onToggle,
  onCatalogUpdate,
}: ServiceSelectionProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [duration, setDuration] = useState("any");
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState<ServicesPagePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const knownRef = useRef<Map<string, CheckInService>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);
  const onCatalogUpdateRef = useRef(onCatalogUpdate);
  onCatalogUpdateRef.current = onCatalogUpdate;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, duration]);

  const mergeKnown = useCallback((items: CheckInService[]) => {
    if (items.length === 0) return;
    const map = knownRef.current;
    for (const item of items) {
      map.set(item.id, item);
    }
    onCatalogUpdateRef.current?.([...map.values()]);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      category,
      duration,
    });
    if (debouncedSearch) params.set("q", debouncedSearch);

    setLoading(true);
    setError("");
    void fetch(`/api/check-in/services?${params}`, {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load services");
        return (await response.json()) as ServicesPagePayload;
      })
      .then((next) => {
        setPayload(next);
        mergeKnown(next.services);
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          loadError instanceof Error ? loadError.message : "Failed to load services"
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, debouncedSearch, category, duration, mergeKnown]);

  useEffect(() => {
    const missing = selectedIds.filter((id) => !knownRef.current.has(id));
    if (missing.length === 0) return;
    const controller = new AbortController();
    void fetch(`/api/check-in/services?ids=${missing.join(",")}`, {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return;
        const next = (await response.json()) as ServicesPagePayload;
        mergeKnown(next.services);
      })
      .catch(() => {
        /* selected ids still submit; bill fills in when catalog loads */
      });
    return () => controller.abort();
  }, [selectedIds, mergeKnown]);

  const topCategories = useMemo(
    () => visibleTopCategories(payload?.categories ?? []),
    [payload?.categories]
  );

  const filtered = payload?.services ?? [];
  const total = payload?.total ?? 0;
  const pageCount = payload?.pageCount ?? 1;
  const selectedKnown = selectedIds
    .map((id) => knownRef.current.get(id))
    .filter((item): item is CheckInService => Boolean(item));

  function selectCategory(next: string) {
    setCategory(next);
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    listRef.current?.scrollTo({ top: 0 });
  }

  return (
    <CheckInCard>
      <CheckInCardHeader
        step={2}
        title="Select Services"
        description={
          selectedIds.length > 0
            ? `${selectedIds.length} service${selectedIds.length > 1 ? "s" : ""} selected`
            : "Choose one or more services for this visit"
        }
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              aria-label="Duration"
              className="h-9 w-full rounded-xl border border-dashboard-border bg-white/80 px-3 text-sm text-dashboard-text shadow-none sm:w-auto"
            >
              <option value="any">Any duration</option>
              <option value="quick">Quick · 30 min or less</option>
              <option value="standard">Standard · 31–90 min</option>
              <option value="long">Long · 90+ min</option>
            </select>
            <div className="relative w-full sm:w-52">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dashboard-muted/60" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services..."
                className="h-9 rounded-xl border-dashboard-border bg-white/80 pl-9 text-sm shadow-none backdrop-blur-sm focus-visible:ring-violet-500/15"
              />
            </div>
          </div>
        }
      />

      <CheckInCardContent className="pt-4">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {["All", ...topCategories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => selectCategory(cat)}
              aria-pressed={category === cat}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                category === cat
                  ? "bg-gradient-to-r from-dashboard-primary to-violet-500 text-white shadow-md shadow-violet-500/25"
                  : "bg-violet-50/80 text-dashboard-muted hover:bg-violet-100 hover:text-dashboard-primary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {selectedKnown.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {selectedKnown.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => onToggle(service.id)}
                className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-medium text-dashboard-primary"
              >
                {service.name}
                <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        )}

        {error ? (
          <p className="rounded-xl border border-red-200/60 bg-red-50/90 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        ) : loading && !payload ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-xl bg-violet-50"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Scissors className="mb-3 h-10 w-10 text-dashboard-muted/30" />
            <p className="text-sm text-dashboard-muted">
              {debouncedSearch || duration !== "any" || category !== "All"
                ? "No services match your search."
                : "Add services in your catalog first."}
            </p>
          </div>
        ) : (
          <>
            <div
              ref={listRef}
              className="max-h-[min(16rem,38vh)] overflow-y-auto overscroll-contain pr-1 sm:max-h-[min(28rem,55vh)]"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {filtered.map((service, index) => {
                  const selected = selectedIds.includes(service.id);
                  const Icon = getServiceIcon(service.category);
                  const colors = getServiceIconColors(service.category);

                  return (
                    <motion.button
                      key={service.id}
                      type="button"
                      onClick={() => onToggle(service.id)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.25 }}
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        "relative flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all duration-200 sm:p-4",
                        selected
                          ? "border-violet-400/60 bg-violet-50/60 shadow-lg shadow-violet-500/10 ring-1 ring-violet-200/50"
                          : "border-transparent bg-white/70 shadow-sm hover:border-violet-200/60 hover:bg-white hover:shadow-md"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                          colors.bg,
                          colors.text
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="min-w-0 break-words font-medium text-dashboard-text">
                            {service.name}
                          </p>
                          <div
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
                              selected
                                ? "border-dashboard-primary bg-dashboard-primary text-white"
                                : "border-violet-200 bg-white"
                            )}
                          >
                            {selected && (
                              <Check className="h-3 w-3" strokeWidth={3} />
                            )}
                          </div>
                        </div>
                        <p className="mt-0.5 text-xs text-dashboard-muted">
                          {service.duration} min · {formatCurrency(service.price)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-dashboard-muted">
                            {service.category}
                          </span>
                          {service.popular && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                              <Sparkles className="h-2.5 w-2.5" />
                              Popular
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-dashboard-border/50 pt-3">
              <p className="text-xs text-dashboard-muted">
                {total === 1 ? "1 service" : `${total} services`}
                {loading ? " · updating…" : ""}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page <= 1 || loading}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-dashboard-border text-dashboard-muted disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[5.5rem] text-center text-xs font-medium text-dashboard-text">
                  Page {payload?.page ?? page} of {pageCount}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(Math.min(pageCount, page + 1))}
                  disabled={page >= pageCount || loading}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-dashboard-border text-dashboard-muted disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </CheckInCardContent>
    </CheckInCard>
  );
}
