"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";
import { SalesHeader } from "./sales-header";
import { SalesKpiCards } from "./sales-kpi-cards";
import { SalesWidgets } from "./sales-widgets";
import { SalesFilterBar } from "./sales-filter-bar";
import { SalesTransactionTable } from "./sales-transaction-table";
import { SalesEmptyState } from "./sales-empty-state";
import { SalesPagination } from "./sales-pagination";
import {
  computeSalesStats,
  filterSalesClientSide,
  getUniqueStylists,
} from "./sales-utils";
import { PAGE_SIZE, type Sale, type SalesFilters } from "./types";

export function SalesListClient({
  sales,
  filters,
}: {
  sales: Sale[];
  filters: SalesFilters;
}) {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState(filters.dateFrom);
  const [dateTo, setDateTo] = useState(filters.dateTo);
  const [search, setSearch] = useState(filters.search);
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [stylist, setStylist] = useState("all");
  const [page, setPage] = useState(1);

  const stats = useMemo(() => computeSalesStats(sales), [sales]);
  const stylists = useMemo(() => getUniqueStylists(sales), [sales]);

  const filteredSales = useMemo(
    () => filterSalesClientSide(sales, paymentMethod, stylist),
    [sales, paymentMethod, stylist]
  );

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = filteredSales.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const end = Math.min(safePage * PAGE_SIZE, filteredSales.length);
  const paginatedSales = filteredSales.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

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

  const hasServerFilters = filters.dateFrom || filters.dateTo || filters.search;
  const showEmptyState = sales.length === 0 && !hasServerFilters;

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
        ) : filteredSales.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[#6B7280]">
            No sales found for the selected filters.
          </div>
        ) : (
          <>
            <SalesTransactionTable sales={paginatedSales} />
            <SalesPagination
              start={start}
              end={end}
              totalCount={filteredSales.length}
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
