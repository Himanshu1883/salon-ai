"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";
import { SalesHeader } from "./sales-header";
import { SalesKpiCards } from "./sales-kpi-cards";
import { SalesWidgets } from "./sales-widgets";
import { SalesFilterBar } from "./sales-filter-bar";
import { SalesTransactionTable } from "./sales-transaction-table";
import { SalesEmptyState } from "./sales-empty-state";
import { SalesPagination } from "./sales-pagination";
import { PAGE_SIZE, type SalesFilters } from "./types";
import type { SalesOverview } from "@/lib/sales/overview";

function overviewQuery(params: {
  dateFrom: string;
  dateTo: string;
  search: string;
  paymentMethod: string;
  stylist: string;
  page: number;
}) {
  const query = new URLSearchParams();
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  if (params.search) query.set("search", params.search);
  if (params.paymentMethod && params.paymentMethod !== "all") {
    query.set("paymentMethod", params.paymentMethod);
  }
  if (params.stylist && params.stylist !== "all") {
    query.set("stylist", params.stylist);
  }
  if (params.page > 1) query.set("page", String(params.page));
  query.set("pageSize", String(PAGE_SIZE));
  return query.toString();
}

export function SalesListClient({
  overview: initialOverview,
  filters,
}: {
  overview: SalesOverview;
  filters: SalesFilters;
}) {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState(filters.dateFrom);
  const [dateTo, setDateTo] = useState(filters.dateTo);
  const [search, setSearch] = useState(filters.search);
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [stylist, setStylist] = useState("all");
  const [page, setPage] = useState(1);
  const [overview, setOverview] = useState(initialOverview);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOverview(initialOverview);
    setPage(1);
    setPaymentMethod("all");
    setStylist("all");
  }, [initialOverview]);

  useEffect(() => {
    const tableFiltersActive =
      paymentMethod !== "all" || stylist !== "all" || page !== 1;
    if (!tableFiltersActive) {
      setOverview(initialOverview);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    fetch(
      `/api/sales/overview?${overviewQuery({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        search: filters.search,
        paymentMethod,
        stylist,
        page,
      })}`,
      { signal: controller.signal }
    )
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load sales");
        const data = (await response.json()) as SalesOverview;
        setOverview(data);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [
    filters.dateFrom,
    filters.dateTo,
    filters.search,
    initialOverview,
    page,
    paymentMethod,
    stylist,
  ]);

  function applyFilters() {
    const params = new URLSearchParams();
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (search) params.set("search", search);
    setPage(1);
    router.push(`/sales?${params.toString()}`);
  }

  function resetFilters() {
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setPaymentMethod("all");
    setStylist("all");
    setPage(1);
    router.push("/sales");
  }

  const { stats, sales, stylists, totalCount, page: safePage, pageSize } =
    overview;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalCount);
  const hasServerFilters = filters.dateFrom || filters.dateTo || filters.search;
  const showEmptyState = totalCount === 0 && !hasServerFilters && page === 1;

  return (
    <div className="space-y-6 pb-8">
      <SalesHeader dateFrom={filters.dateFrom} dateTo={filters.dateTo} />

      <SalesKpiCards stats={stats} />

      <SalesWidgets stats={stats} />

      <div className="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white shadow-[0_4px_24px_rgba(28,16,61,0.05)]">
        <div className="flex items-center gap-2 border-b border-[#ECECEC] px-5 py-4">
          <Receipt className="h-5 w-5 text-[#6C3CF0]" />
          <h2 className="text-base font-semibold text-[#1C103D]">
            Transaction History
          </h2>
        </div>

        <SalesFilterBar
          search={search}
          dateFrom={dateFrom}
          dateTo={dateTo}
          paymentMethod={paymentMethod}
          stylist={stylist}
          stylists={stylists}
          onSearchChange={setSearch}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onPaymentMethodChange={(v) => {
            setPaymentMethod(v);
            setPage(1);
          }}
          onStylistChange={(v) => {
            setStylist(v);
            setPage(1);
          }}
          onApply={applyFilters}
          onReset={resetFilters}
        />

        {showEmptyState ? (
          <SalesEmptyState />
        ) : totalCount === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[#6B7280]">
            No sales found for the selected filters.
          </div>
        ) : (
          <>
            <div className={loading ? "opacity-60" : undefined}>
              <SalesTransactionTable sales={sales} />
            </div>
            <SalesPagination
              start={start}
              end={end}
              totalCount={totalCount}
              page={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
