"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Contact,
  Loader2,
  Package,
  Receipt,
  Scissors,
  Search,
  Users,
} from "lucide-react";
import {
  globalSearch,
  type GlobalSearchResult,
  type GlobalSearchResultType,
} from "@/actions/search";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<GlobalSearchResultType, typeof Search> = {
  customer: Contact,
  appointment: Calendar,
  invoice: Receipt,
  service: Scissors,
  staff: Users,
  product: Package,
};

type DashboardSearchProps = {
  className?: string;
};

export function DashboardSearch({ className }: DashboardSearchProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<
    Awaited<ReturnType<typeof globalSearch>>["groups"]
  >([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const requestIdRef = useRef(0);

  const flatResults = useMemo(
    () => groups.flatMap((group) => group.items),
    [groups]
  );

  const showDropdown = open && (loading || query.trim().length >= 2);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const navigateTo = useCallback(
    (result: GlobalSearchResult) => {
      close();
      setQuery("");
      setGroups([]);
      router.push(result.href);
    },
    [close, router]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [close]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setGroups([]);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    const timer = window.setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setLoading(true);

      try {
        const response = await globalSearch(trimmed);
        if (requestId !== requestIdRef.current) return;
        setGroups(response.groups);
        setActiveIndex(response.total > 0 ? 0 : -1);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setGroups([]);
        setActiveIndex(-1);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      inputRef.current?.blur();
      return;
    }

    if (!flatResults.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        current < flatResults.length - 1 ? current + 1 : 0
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current > 0 ? current - 1 : flatResults.length - 1
      );
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const result = flatResults[activeIndex];
      if (result) navigateTo(result);
    }
  }

  let resultIndex = -1;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "flex h-12 w-full items-center gap-2 rounded-2xl border bg-dashboard-bg px-3 transition-colors sm:h-11 sm:gap-3 sm:px-4",
          open
            ? "border-violet-300 bg-white shadow-sm ring-2 ring-violet-100"
            : "border-dashboard-border hover:border-violet-200 hover:bg-white"
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-dashboard-muted" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder="Search clients, appointments..."
          aria-label="Global search"
          aria-expanded={showDropdown}
          aria-controls="dashboard-search-results"
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `dashboard-search-option-${activeIndex}` : undefined
          }
          autoComplete="off"
          className="min-w-0 flex-1 h-full border-0 bg-transparent p-0 text-sm leading-normal text-dashboard-text outline-none placeholder:text-dashboard-muted"
        />
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-dashboard-muted" />
        ) : (
          <kbd className="hidden rounded-lg border border-dashboard-border bg-white px-1.5 py-0.5 text-[10px] font-medium text-dashboard-muted sm:inline">
            ⌘K
          </kbd>
        )}
      </div>

      {showDropdown && (
        <div
          id="dashboard-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(24rem,60dvh)] overflow-hidden rounded-2xl border border-dashboard-border bg-white shadow-xl"
        >
          {loading && flatResults.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-dashboard-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          ) : flatResults.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-medium text-dashboard-text">
                No results for &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="mt-1 text-xs text-dashboard-muted">
                Try a customer name, phone number, service, or invoice detail.
              </p>
            </div>
          ) : (
            <div className="max-h-[min(24rem,70vh)] overflow-y-auto py-2">
              {groups.map((group) => (
                <div key={group.type} className="px-2 py-1">
                  <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-dashboard-muted">
                    {group.label}
                  </p>
                  <ul>
                    {group.items.map((result) => {
                      resultIndex += 1;
                      const index = resultIndex;
                      const Icon = TYPE_ICONS[result.type];
                      const isActive = index === activeIndex;

                      return (
                        <li key={`${result.type}-${result.id}`}>
                          <button
                            id={`dashboard-search-option-${index}`}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => navigateTo(result)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                              isActive
                                ? "bg-violet-50 text-dashboard-text"
                                : "text-dashboard-text hover:bg-dashboard-bg"
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                                isActive
                                  ? "bg-violet-100 text-dashboard-primary"
                                  : "bg-dashboard-bg text-dashboard-muted"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">
                                {result.title}
                              </span>
                              {result.subtitle && (
                                <span className="mt-0.5 block truncate text-xs text-dashboard-muted">
                                  {result.subtitle}
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
