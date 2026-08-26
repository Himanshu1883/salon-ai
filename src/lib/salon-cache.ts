import { after } from "next/server";
import { revalidateTag, unstable_cache } from "next/cache";
import { cachedRead, invalidateMemoryCachePrefix } from "@/lib/memory-cache";

export type SalonCacheScope =
  | "dashboard-kpis"
  | "dashboard-widgets"
  | "dashboard-stats"
  | "queue"
  | "team"
  | "staff-analytics"
  | "catalog"
  | "catalog-options"
  | "stock"
  | "customers"
  | "billing"
  | "check-in"
  | "layout-alerts"
  | "layout-context";

export function salonCacheTag(salonId: string, scope: SalonCacheScope): string {
  return `${scope}:${salonId}`;
}

/** Clear in-process caches immediately (cheap). */
export function invalidateSalonMemoryCache(salonId: string) {
  invalidateMemoryCachePrefix(`salon-cache:`);
  invalidateMemoryCachePrefix(`salon-layout:${salonId}`);
  invalidateMemoryCachePrefix(`salon-plan:${salonId}`);
  invalidateMemoryCachePrefix(`salon-blocked:${salonId}`);
}

/** Bust cached reads after mutations. */
export function revalidateSalonCache(
  salonId: string,
  ...scopes: SalonCacheScope[]
) {
  invalidateSalonMemoryCache(salonId);
  for (const scope of scopes) {
    revalidateTag(salonCacheTag(salonId, scope), "max");
  }
}

/**
 * Non-blocking cache bust for hot-path mutations (e.g. catalog save).
 * Returns before tag revalidation so server actions don't wait on RSC refetch.
 */
export function scheduleSalonCacheRevalidation(
  salonId: string,
  ...scopes: SalonCacheScope[]
) {
  invalidateSalonMemoryCache(salonId);
  after(() => {
    for (const scope of scopes) {
      revalidateTag(salonCacheTag(salonId, scope), "max");
    }
  });
}

type CacheOpts = {
  revalidate?: number;
  /** Disambiguate multiple caches under the same scope. */
  key?: string;
};

/** Per-salon unstable_cache wrapper with tag invalidation support. */
export function cachedBySalon<T>(
  scope: SalonCacheScope,
  fetcher: (salonId: string) => Promise<T>,
  opts: CacheOpts = {}
) {
  const revalidate = opts.revalidate ?? 60;
  const cacheKey = opts.key ?? "default";

  return (salonId: string) =>
    cachedRead(`salon-cache:${scope}:${cacheKey}:${salonId}`, revalidate, () =>
      unstable_cache(() => fetcher(salonId), [scope, cacheKey, salonId], {
        revalidate,
        tags: [salonCacheTag(salonId, scope)],
      })()
    );
}
