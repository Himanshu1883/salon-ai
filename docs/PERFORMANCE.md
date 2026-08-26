# Performance & Deployment Notes

## Railway region alignment

### Current configuration (from project files)

| Component | Hosting | Region source |
|-----------|---------|---------------|
| **PostgreSQL** | Railway (`*.proxy.rlwy.net`) | Determined by Railway project — check **Railway → Postgres → Settings → Region** |
| **Production app** | Likely Vercel (`vercel.json` present) | Vercel project region — check **Vercel → Project → Settings → Functions** |
| **Local development** | Your machine | Connects to Railway via `DATABASE_PUBLIC_URL` |

### What to verify (do not change automatically)

1. Open Railway dashboard → Postgres service → note **region**.
2. Open Vercel dashboard → Project → Functions / Deployment region.
3. **Ideal:** App compute and Postgres in the **same region**.
4. **Current local dev:** Each DB query includes **~250–530 ms** round-trip to Railway (measured). Cold connection **~2 s**.

### Recommended production architecture

```
User browser
    ↓
Next.js backend (same region as Postgres)
    ↓
PostgreSQL (Railway, same region)
    ↓
Aggregated SQL / minimal round trips
```

If the app stays on **Vercel** and DB on **Railway**, pick regions that are **geographically close**.

---

## Local development strategy

Local dev **will not** match production latency while pointing at remote Railway Postgres.

| Strategy | Latency | Notes |
|----------|---------|-------|
| **Local PostgreSQL** | ~1–5 ms/query | Best daily dev. Point `DATABASE_URL` to `localhost`. |
| **Railway public URL** (current) | ~250–530 ms/query | Shared data; slow for multi-query pages. |
| **Railway dev environment** | ~5–30 ms if co-located | Deploy dev Next.js on Railway next to DB. |

---

## Measuring performance

```bash
npx tsx scripts/perf-diagnostic.ts
```
