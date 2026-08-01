"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Scissors, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import {
  CheckInCard,
  CheckInCardContent,
  CheckInCardHeader,
} from "./check-in-card";
import {
  SERVICE_CATEGORIES,
  type CheckInService,
  type ServiceCategoryFilter,
} from "./types";
import {
  filterServices,
  getServiceIcon,
  getServiceIconColors,
  isPopularService,
} from "./utils";

type ServiceSelectionProps = {
  services: CheckInService[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

export function ServiceSelection({
  services,
  selectedIds,
  onToggle,
}: ServiceSelectionProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ServiceCategoryFilter>("Popular");

  const filtered = useMemo(
    () => filterServices(services, search, category),
    [services, search, category]
  );

  const availableCategories = useMemo(() => {
    const cats = new Set(services.map((s) => s.category.toLowerCase()));
    return SERVICE_CATEGORIES.filter(
      (c) =>
        c === "Popular" ||
        [...cats].some((cat) => cat.includes(c.toLowerCase()))
    );
  }, [services]);

  if (services.length === 0) {
    return (
      <CheckInCard>
        <CheckInCardHeader
          step={2}
          title="Select Services"
          description="No services configured yet"
        />
        <CheckInCardContent>
          <p className="text-sm text-dashboard-muted">
            Add services in your catalog first.
          </p>
        </CheckInCardContent>
      </CheckInCard>
    );
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
          <div className="relative w-full sm:w-52">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dashboard-muted/60" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="h-9 rounded-xl border-dashboard-border bg-white/80 pl-9 text-sm shadow-none backdrop-blur-sm focus-visible:ring-violet-500/15"
            />
          </div>
        }
      />

      <CheckInCardContent className="pt-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                category === cat
                  ? "bg-gradient-to-r from-dashboard-primary to-violet-500 text-white shadow-md shadow-violet-500/25"
                  : "bg-violet-50/80 text-dashboard-muted hover:bg-violet-100 hover:text-dashboard-primary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Scissors className="mb-3 h-10 w-10 text-dashboard-muted/30" />
            <p className="text-sm text-dashboard-muted">
              No services match your search.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((service, index) => {
              const selected = selectedIds.includes(service.id);
              const Icon = getServiceIcon(service.category);
              const colors = getServiceIconColors(service.category);
              const popular = isPopularService(service, services);

              return (
                <motion.button
                  key={service.id}
                  type="button"
                  onClick={() => onToggle(service.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.25 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    "relative flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200",
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
                      <p className="font-medium text-dashboard-text">
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
                        {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                      </div>
                    </div>
                    <p className="mt-0.5 text-xs text-dashboard-muted">
                      {service.duration} min · {formatCurrency(service.price)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-dashboard-muted">
                        {service.category}
                      </span>
                      {popular && (
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
        )}
      </CheckInCardContent>
    </CheckInCard>
  );
}
