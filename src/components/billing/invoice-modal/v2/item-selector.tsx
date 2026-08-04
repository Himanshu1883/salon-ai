"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  Clock,
  Package,
  Scissors,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import {
  computeAnchoredDropdownStyle,
  resolvePortalContainer,
} from "../anchored-dropdown-portal";
import { v2 } from "./tokens";

export type CatalogOption = {
  type: "SERVICE" | "PRODUCT";
  id: string;
  label: string;
  category: string;
  price: number;
  duration: number;
  taxRate: number;
};

function catalogKey(opt: CatalogOption) {
  return `${opt.type}:${opt.id}`;
}

function dedupeOptions(opts: CatalogOption[]) {
  const seen = new Set<string>();
  return opts.filter((o) => {
    const key = catalogKey(o);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const FAVORITES_KEY = "glowdesk-invoice-favorites";
const RECENT_KEY = "glowdesk-invoice-recent-items";

function loadJsonArray(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveJsonArray(key: string, values: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(values.slice(0, 12)));
}

export function trackRecentItem(catalogKey: string) {
  const recent = loadJsonArray(RECENT_KEY).filter((k) => k !== catalogKey);
  recent.unshift(catalogKey);
  saveJsonArray(RECENT_KEY, recent);
}

function ItemDropdownPortal({
  anchorRef,
  open,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  children: ReactNode;
}) {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const container = resolvePortalContainer(anchor);
    setStyle(
      computeAnchoredDropdownStyle(anchor, container, { minWidth: 360 })
    );
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) return;
    setPortalContainer(resolvePortalContainer(anchorRef.current));
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition, anchorRef]);

  if (!open || typeof document === "undefined" || !portalContainer) return null;

  return createPortal(
    <div
      style={style}
      className="max-h-80 overflow-y-auto rounded-[14px] border border-[#ECECF5] bg-white shadow-[0_16px_48px_rgba(124,58,237,0.14)]"
      data-invoice-item-dropdown
      onPointerDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    portalContainer
  );
}

function ItemIcon({ type }: { type: "SERVICE" | "PRODUCT" }) {
  const Icon = type === "SERVICE" ? Scissors : Package;
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#7C3AED]/10">
      <Icon className="h-4.5 w-4.5 text-[#7C3AED]" />
    </div>
  );
}

type ItemSelectorProps = {
  value: string;
  options: CatalogOption[];
  servicesByCategory: Map<string, { id: string; name: string; duration: number; price: number }[]>;
  products: { id: string; name: string; category: string; retailPrice: number }[];
  onSelect: (value: string) => void;
  error?: string;
};

export function ItemSelector({
  value,
  options,
  servicesByCategory,
  products,
  onSelect,
  error,
}: ItemSelectorProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentKeys, setRecentKeys] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const uniqueOptions = useMemo(() => dedupeOptions(options), [options]);

  const selected = uniqueOptions.find((o) => catalogKey(o) === value);

  useEffect(() => {
    setFavorites(loadJsonArray(FAVORITES_KEY));
    setRecentKeys(loadJsonArray(RECENT_KEY));
  }, []);

  useEffect(() => {
    if (selected) setQuery(selected.label);
  }, [selected?.label]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDownOutside(e: PointerEvent) {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest("[data-invoice-item-dropdown]")
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDownOutside, true);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDownOutside, true);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return uniqueOptions;
    return uniqueOptions.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q)
    );
  }, [uniqueOptions, query]);

  const favoriteOptions = useMemo(
    () =>
      dedupeOptions(
        uniqueOptions.filter((o) => favorites.includes(catalogKey(o)))
      ),
    [uniqueOptions, favorites]
  );

  const recentOptions = useMemo(
    () =>
      dedupeOptions(
        recentKeys
          .map((key) => uniqueOptions.find((o) => catalogKey(o) === key))
          .filter(Boolean) as CatalogOption[]
      ),
    [uniqueOptions, recentKeys]
  );

  const pinnedKeys = useMemo(() => {
    if (query.trim()) return new Set<string>();
    return new Set(
      [...favoriteOptions, ...recentOptions].map((o) => catalogKey(o))
    );
  }, [favoriteOptions, recentOptions, query]);

  function toggleFavorite(catalogKey: string, e: React.MouseEvent) {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(catalogKey)
        ? prev.filter((k) => k !== catalogKey)
        : [catalogKey, ...prev].slice(0, 20);
      saveJsonArray(FAVORITES_KEY, next);
      return next;
    });
  }

  function pick(key: string) {
    const opt = uniqueOptions.find((o) => catalogKey(o) === key);
    if (opt) {
      setQuery(opt.label);
      trackRecentItem(key);
      setRecentKeys(loadJsonArray(RECENT_KEY));
    }
    onSelect(key);
    setOpen(false);
  }

  function renderOption(opt: CatalogOption) {
    const key = catalogKey(opt);
    const isFav = favorites.includes(key);
    return (
      <div
        key={key}
        role="button"
        tabIndex={0}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          pick(key);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            pick(key);
          }
        }}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#7C3AED]/5"
      >
        <ItemIcon type={opt.type} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#111827]">{opt.label}</p>
          <p className="text-xs text-[#6B7280]">
            {opt.category}
            {opt.duration > 0 && ` · ${formatDuration(opt.duration)}`}
            {" · "}₹{opt.price}
          </p>
        </div>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => toggleFavorite(key, e)}
          className={cn(
            "rounded-lg p-1.5 transition-colors",
            isFav ? "text-amber-500" : "text-[#6B7280] hover:text-amber-500"
          )}
          aria-label={isFav ? "Remove favorite" : "Add favorite"}
        >
          <Star className={cn("h-4 w-4", isFav && "fill-current")} />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-1.5">
      <div className="relative">
        {!selected && (
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
        )}
        {selected && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <ItemIcon type={selected.type} />
          </div>
        )}
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search service or product…"
          className={cn(
            v2.input,
            "w-full pr-4",
            selected ? "pl-14" : "pl-11",
            error && v2.inputError
          )}
        />
      </div>

      <ItemDropdownPortal anchorRef={containerRef} open={open}>
        {favoriteOptions.length > 0 && !query.trim() && (
          <div className="border-b border-[#ECECF5]">
            <p className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
              <Star className="h-3 w-3 text-amber-500" />
              Favorites
            </p>
            {favoriteOptions.map(renderOption)}
          </div>
        )}
        {recentOptions.length > 0 && !query.trim() && (
          <div className="border-b border-[#ECECF5]">
            <p className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
              <Clock className="h-3 w-3" />
              Recent
            </p>
            {recentOptions.map(renderOption)}
          </div>
        )}
        {!query.trim() && favoriteOptions.length === 0 && recentOptions.length === 0 && (
          <p className="flex items-center gap-2 px-4 py-3 text-xs text-[#6B7280]">
            <Sparkles className="h-3.5 w-3.5 text-[#7C3AED]" />
            Type to search or browse categories below
          </p>
        )}
        {query.trim() ? (
          filtered.length > 0 ? (
            filtered.map(renderOption)
          ) : (
            <p className="px-4 py-6 text-center text-sm text-[#6B7280]">
              No items match &ldquo;{query}&rdquo;
            </p>
          )
        ) : (
          <>
            {Array.from(servicesByCategory.entries()).map(([category, items]) => {
              const categoryItems = dedupeOptions(
                items
                  .map((s) =>
                    uniqueOptions.find(
                      (o) => o.type === "SERVICE" && o.id === s.id
                    )
                  )
                  .filter(Boolean) as CatalogOption[]
              ).filter((o) => !pinnedKeys.has(catalogKey(o)));

              if (categoryItems.length === 0) return null;

              return (
                <div key={category}>
                  <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    {category}
                  </p>
                  {categoryItems.map(renderOption)}
                </div>
              );
            })}
            {products.length > 0 && (
              <div>
                <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Products
                </p>
                {dedupeOptions(
                  products
                    .map((p) =>
                      uniqueOptions.find(
                        (o) => o.type === "PRODUCT" && o.id === p.id
                      )
                    )
                    .filter(Boolean) as CatalogOption[]
                )
                  .filter((o) => !pinnedKeys.has(catalogKey(o)))
                  .map(renderOption)}
              </div>
            )}
          </>
        )}
      </ItemDropdownPortal>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
