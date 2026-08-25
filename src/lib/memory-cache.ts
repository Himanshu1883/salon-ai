type CacheEntry = { value: unknown; expiresAt: number };

const store = new Map<string, CacheEntry>();

/** Short-lived in-process cache — helps local dev where unstable_cache resets each request. */
export function cachedRead<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) {
    return Promise.resolve(hit.value as T);
  }

  return loader().then((value) => {
    store.set(key, { value, expiresAt: now + ttlSeconds * 1000 });
    return value;
  });
}

export function invalidateMemoryCachePrefix(prefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
