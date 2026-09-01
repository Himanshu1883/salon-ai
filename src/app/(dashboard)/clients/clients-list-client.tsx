"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { CustomerListItem, CustomerSort } from "@/actions/customers";
import { ClientsHeader } from "@/components/clients/clients-header";
import { ClientsSummaryCards } from "@/components/clients/clients-summary-cards";
import { ClientsImportBanner } from "@/components/clients/clients-import-banner";
import { ClientsFilterToolbar } from "@/components/clients/clients-filter-toolbar";
import { ClientsTable } from "@/components/clients/clients-table";
import { ClientsPagination } from "@/components/clients/clients-pagination";
import { ClientsInsightsPanel } from "@/components/clients/clients-insights-panel";
import { ClientsAddDialog } from "@/components/clients/clients-add-dialog";
import { ClientsImportDialog } from "@/components/clients/clients-import-dialog";
import { ClientsFiltersDialog } from "@/components/clients/clients-filters-dialog";
import { computeClientStats } from "@/components/clients/clients-utils";

export function ClientsListClient({
  customers: initialCustomers,
  totalCount: initialTotalCount,
  page,
  pageSize,
  search: initialSearch,
  sort: initialSort,
}: {
  customers: CustomerListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  sort: CustomerSort;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [customers, setCustomers] = useState(initialCustomers);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<CustomerSort>(initialSort);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCustomers(initialCustomers);
    setTotalCount(initialTotalCount);
  }, [initialCustomers, initialTotalCount]);

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const isPartialData = totalCount > customers.length;

  const stats = useMemo(
    () => computeClientStats(customers, totalCount),
    [customers, totalCount]
  );

  const pushParams = useCallback(
    (updates: { search?: string; sort?: CustomerSort; page?: number }) => {
      const params = new URLSearchParams();
      const nextSearch = updates.search ?? search;
      const nextSort = updates.sort ?? sort;
      const nextPage = updates.page ?? page;

      if (nextSearch.trim()) params.set("search", nextSearch.trim());
      if (nextSort !== "createdAt_desc") params.set("sort", nextSort);
      if (nextPage > 1) params.set("page", String(nextPage));

      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `/clients?${qs}` : "/clients");
      });
    },
    [router, search, sort, page]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== initialSearch) {
        pushParams({ search, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, initialSearch, pushParams]);

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(customers.map((c) => c.id)) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleSuccess(newCustomer: CustomerListItem) {
    setAddOpen(false);
    if (page === 1 && !search.trim()) {
      setCustomers((prev) => [newCustomer, ...prev].slice(0, pageSize));
      setTotalCount((c) => c + 1);
    } else {
      setTotalCount((c) => c + 1);
    }
  }

  function handleReset() {
    setSearch("");
    setSort("createdAt_desc");
    startTransition(() => {
      router.push("/clients");
    });
  }

  return (
    <div className="min-w-0 max-w-full space-y-3 overflow-x-hidden sm:space-y-6">
      <ClientsHeader
        totalCount={totalCount}
        onImport={() => setImportOpen(true)}
        onAdd={() => setAddOpen(true)}
      />

      <ClientsSummaryCards stats={stats} isPartialData={isPartialData} />

      <ClientsImportBanner onStartImport={() => setImportOpen(true)} />

      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-start xl:gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-w-0 flex-1 space-y-3 sm:space-y-4"
        >
          <ClientsFilterToolbar
            search={search}
            sort={sort}
            onSearchChange={setSearch}
            onSortChange={(next) => {
              setSort(next);
              pushParams({ sort: next, page: 1 });
            }}
            onFiltersOpen={() => setFiltersOpen(true)}
            onReset={handleReset}
          />

          <ClientsTable
            customers={customers}
            selected={selected}
            isPending={isPending}
            onToggleAll={toggleAll}
            onToggleOne={toggleOne}
            onAdd={() => setAddOpen(true)}
            onImport={() => setImportOpen(true)}
          />

          {totalCount > 0 && (
            <ClientsPagination
              start={start}
              end={end}
              totalCount={totalCount}
              page={page}
              totalPages={totalPages}
              isPending={isPending}
              onPageChange={(nextPage) => pushParams({ page: nextPage })}
            />
          )}
        </motion.div>

        <ClientsInsightsPanel customers={customers} stats={stats} />
      </div>

      <ClientsAddDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={handleSuccess}
      />

      <ClientsImportDialog open={importOpen} onOpenChange={setImportOpen} />

      <ClientsFiltersDialog open={filtersOpen} onOpenChange={setFiltersOpen} />
    </div>
  );
}
