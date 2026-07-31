"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
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
      <div className="rounded-[20px] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1C103D]">Select Services</h2>
        <p className="mt-4 text-sm text-[#6B7280]">
          No services configured. Add services in your catalog first.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#1C103D]">Select Services</h2>
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="h-10 rounded-xl border-[#E8ECF4] bg-[#F7F8FC] pl-9 shadow-none focus-visible:ring-[#6C3BFF]/20"
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {availableCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
              category === cat
                ? "bg-[#6C3BFF] text-white shadow-md shadow-[#6C3BFF]/25"
                : "bg-[#F7F8FC] text-[#6B7280] hover:bg-[#EDE9FE] hover:text-[#6C3BFF]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#6B7280]">
          No services match your search.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((service) => {
            const selected = selectedIds.includes(service.id);
            const Icon = getServiceIcon(service.category);
            const colors = getServiceIconColors(service.category);
            const popular = isPopularService(service, services);

            return (
              <motion.button
                key={service.id}
                type="button"
                onClick={() => onToggle(service.id)}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  "relative flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-shadow",
                  selected
                    ? "border-[#6C3BFF] bg-[#EDE9FE]/40 shadow-lg shadow-[#6C3BFF]/15"
                    : "border-transparent bg-[#F7F8FC] shadow-sm hover:border-[#6C3BFF]/20 hover:shadow-md"
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
                    <p className="font-medium text-[#1C103D]">{service.name}</p>
                    <div
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
                        selected
                          ? "border-[#6C3BFF] bg-[#6C3BFF] text-white"
                          : "border-[#D1D5DB] bg-white"
                      )}
                    >
                      {selected && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    {service.duration} min · {formatCurrency(service.price)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-[#6B7280]">
                      {service.category}
                    </span>
                    {popular && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-medium text-[#D97706]">
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
    </div>
  );
}
