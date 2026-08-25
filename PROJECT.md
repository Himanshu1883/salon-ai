# Glow Desk / Go Tix — AI & Developer Project Guide

> **Purpose:** Single source of truth for understanding this codebase. Give this file to Cursor, ChatGPT, Claude, or any AI before asking for changes. It explains architecture, conventions, routing, auth, database, and where to edit code.

**Product:** Multi-tenant salon management SaaS (ERP) — appointments, walk-in queue, billing, inventory, staff, reports, memberships, WhatsApp, AI scheduling, face attendance, platform admin.

**Production domain:** `https://www.gotix.io` (also referenced as Go Tix in marketing UI)

---

## 1. Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | **Next.js 16** (App Router, Turbopack in dev) | Read `node_modules/next/dist/docs/` before changing Next APIs — v16 has breaking changes |
| Language | **TypeScript 5** | Strict typing throughout |
| UI | **React 19** | Server Components + Client Components |
| Styling | **Tailwind CSS 4** | Utility-first; design tokens in `globals.css` |
| Components | **shadcn/ui** (Radix UI) | `src/components/ui/` |
| Icons | **lucide-react** | |
| Animation | **framer-motion** | Marketing / landing sections |
| Charts | **recharts** | Reports & dashboards |
| ORM | **Prisma 7** | PostgreSQL via `@prisma/adapter-pg` + `pg` driver |
| Auth | **NextAuth.js v5** (`next-auth@5.0.0-beta.32`) | Credentials provider, JWT sessions |
| Validation | **Zod 4** | All input schemas in `src/lib/validations.ts` |
| Forms | **react-hook-form** + `@hookform/resolvers` | Client forms |
| Password hashing | **bcryptjs** | Cost factor 10 |
| Face recognition | **@vladmandic/face-api** | Browser-based attendance kiosk |

### NOT used
- **Redux** — no global client store; use React state, Server Actions, and NextAuth session
- **tRPC / GraphQL** — mutations via Server Actions, reads via Server Components or API routes
- **MongoDB** — PostgreSQL only

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
│  React Client Components · next-auth/react · local useState      │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                   Next.js App Router (Server)                    │
│  Server Components · Server Actions · API Routes · Middleware    │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              Prisma Client → PostgreSQL (multi-tenant)           │
└─────────────────────────────────────────────────────────────────┘
```

### Request flow (salon dashboard)
1. User visits `/{salonSlug}/dashboard`
2. **Middleware** (`src/middleware.ts`) checks JWT session, rewrites URL to internal `(dashboard)` route, sets `x-salon-slug` header + `salon-slug` cookie
3. **Dashboard layout** (`src/app/(dashboard)/layout.tsx`) calls `getAuthSession()`, loads plan + subscription gate
4. Page (Server Component) fetches data via Prisma or cached helpers
5. Client components call **Server Actions** in `src/actions/` for mutations

### Request flow (platform admin)
1. User visits `/admin/login` → credentials sign-in
2. Middleware guards `/admin/*` routes via `platformRole` / `isSuperAdmin`
3. Admin panel under `src/app/admin/(panel)/`

---

## 3. Directory Structure

```
salon-ai/
├── prisma/
│   ├── schema.prisma          # Full DB schema (~50 models)
│   ├── migrations/            # SQL migrations
│   └── seed.ts                # Demo data + super admin
├── prisma.config.ts           # Prisma CLI config (migrations use direct URL)
├── scripts/                   # CLI utilities (check-db, ensure-admin, seed helpers)
├── public/
│   └── models/                # face-api weights for attendance
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── (marketing)/       # Public marketing pages (pricing, about, etc.)
│   │   ├── (auth)/            # Login, signup, forgot/reset password
│   │   ├── (dashboard)/       # Salon ERP (protected) — all tenant features
│   │   ├── admin/             # Platform admin login + panel
│   │   └── api/               # REST endpoints (auth, cron, uploads, widgets)
│   ├── actions/               # Server Actions ("use server") — primary mutation layer
│   ├── components/            # React components by domain
│   ├── generated/prisma/      # Generated Prisma client (do not edit)
│   └── lib/                   # Shared utilities, auth, paths, plans, validations
├── .env / .env.example
├── AGENTS.md                  # Next.js 16 agent rules (read before coding)
├── PROJECT.md                 # This file
└── README.md                  # Human setup & deploy guide
```

### App route groups

| Group | Path prefix | Purpose |
|-------|-------------|---------|
| `(marketing)` | `/`, `/pricing`, `/about`, `/contact`, … | Public marketing site |
| `(auth)` | `/login`, `/signup`, `/forgot-password`, `/reset-password` | Auth flows (salon-scoped via middleware rewrite) |
| `(dashboard)` | Internal paths like `/dashboard`, `/billing`, … | Salon ERP — accessed via `/{slug}/dashboard` |
| `admin` | `/admin`, `/admin/salons`, … | Platform admin panel |

---

## 4. Multi-Tenancy & URL Routing

Each salon has a unique **`slug`**. Tenant URLs use the slug as the first path segment.

### URL pattern
```
/{salonSlug}/dashboard
/{salonSlug}/billing
/{salonSlug}/team/attendance
/{salonSlug}/login
```

### Internal vs external paths
- **External (browser):** `/{salonSlug}/dashboard`
- **Internal (file system):** `src/app/(dashboard)/dashboard/page.tsx`
- **Middleware** rewrites `/{slug}/...` → `/...` and injects salon context

### Reserved slugs (cannot be salon names)
Defined in `src/lib/salon-paths.ts` → `RESERVED_SALON_SLUGS` (includes `admin`, `api`, `login`, `pricing`, marketing routes, etc.)

### Key path helpers (`src/lib/salon-paths.ts`)
```ts
salonPath(slug, "/billing")           // → "/my-salon/billing"
parseSalonPrefixedPath(pathname)      // → { salonSlug, innerPath }
isSalonProtectedRoute(pathname)       // checks if route needs auth
getAppOrigin()                        // from NEXT_PUBLIC_APP_URL / AUTH_URL
```

### Legacy redirects (middleware)
Old flat routes redirect to slug-prefixed routes:
- `/appointments` → `/{slug}/sales/appointments`
- `/services` → `/{slug}/catalog/services`
- `/employees` → `/{slug}/team/members`
- `/customers` → `/{slug}/clients`

---

## 5. Authentication

### Provider
NextAuth **Credentials** provider in `src/lib/auth.ts`. Config split:
- `src/lib/auth.config.ts` — callbacks, pages, session strategy (JWT)
- `src/lib/auth.ts` — full NextAuth instance + `authorize()` + session helpers

### Session shape (JWT token fields)
```ts
{
  id, email, name, role,           // user fields
  isSuperAdmin, platformRole,      // platform admin
  salonId, salonName, salonSlug, plan  // tenant context (null for platform admins)
}
```

### Login entry points
| URL | Who |
|-----|-----|
| `/admin/login` | Platform admins (`SUPER_ADMIN`, `CUSTOMER_SUPPORT`) |
| `/login` or `/{slug}/login` | Salon owners/staff |

### Default credentials (after seed / ensure-admin)
| Account | Email | Password | URL |
|---------|-------|----------|-----|
| Platform admin | `admin@salon.ai` | `admin1234` | `/admin/login` |
| Demo salon owner | `demo@salon.ai` | `demo1234` | `/{slug}/login` |

Reset admin password: `npm run db:ensure-admin`

### Auth helpers (`src/lib/auth.ts`)
```ts
getAuthSession()        // cached auth() per request
requireSession()        // salon user with salonId — redirects if missing
requireSuperAdmin()     // SUPER_ADMIN only
requirePlatformAdmin()  // any platform role
requireOwnerOrManager() // role gate for sensitive salon actions
```

### Sign-in authorize logic (order)
1. **Impersonation token** (admin viewing as salon owner)
2. Validate email/password via `loginSchema` (Zod, trims password)
3. Find user by email in DB
4. `bcrypt.compare(password, user.password)`
5. If `platformRole` or `isSuperAdmin` → return platform admin session (no salon)
6. Else require `user.salon`; optionally validate `salonSlug` param matches

### Middleware auth (`src/middleware.ts`)
- Uses lightweight NextAuth wrapper (no DB in middleware)
- Protects `/admin/*` and salon routes
- Redirects unauthenticated users to appropriate login
- Prevents cross-tenant access (session salonSlug must match URL slug)

### Common auth gotcha
Browser **password autofill** can submit wrong saved credentials. Admin login form disables autofill. Use incognito or clear saved passwords for localhost if login fails despite correct DB hash.

---

## 6. Platform Admin

### Roles (`PlatformRole` enum)
| Role | Access |
|------|--------|
| `SUPER_ADMIN` | Full admin panel |
| `CUSTOMER_SUPPORT` | `/admin/support`, `/admin/salons` only |

Logic: `src/lib/platform-permissions.ts`

### Admin routes
| Route | Description |
|-------|-------------|
| `/admin` | Dashboard (super admin only) |
| `/admin/salons` | All tenant salons |
| `/admin/salons/[id]` | Tenant detail |
| `/admin/support` | Support ticket workspace |
| `/admin/users` | Platform user management (super admin) |

### Impersonation
Admin can impersonate salon owner via token → `POST /api/admin/impersonate`

---

## 7. Database

### Provider
**PostgreSQL** — Vercel Postgres, Neon, Railway, or local Docker.

### Prisma setup
- Schema: `prisma/schema.prisma`
- Client output: `src/generated/prisma/` (import from `@/generated/prisma/client`)
- App singleton: `src/lib/prisma.ts` → `getPrismaClient()` in `src/lib/create-prisma-client.ts`
- Prisma v7 requires **driver adapter** (`PrismaPg` + `pg` Pool)

### URL resolution (`src/lib/database-url.ts`)
- **Local dev + Railway:** prefers `DATABASE_PUBLIC_URL` (public `*.proxy.rlwy.net`) over private `*.railway.internal`
- **Migrations:** use direct/non-pooled URL via `prisma.config.ts`
- **Railway SSL:** `rejectUnauthorized: false` when host is `.proxy.rlwy.net`

### Core models (tenant-scoped via `salonId`)
| Model | Purpose |
|-------|---------|
| `Salon` | Tenant root — slug, plan, settings |
| `User` | Login account (owner/staff or platform admin) |
| `Employee` | Staff member (separate from User login) |
| `Customer` | Salon clients |
| `Service`, `ServiceCategory` | Service catalog |
| `Appointment` | Scheduled bookings |
| `QueueEntry` | Walk-in queue |
| `Invoice`, line items | Billing |
| `StockItem`, `PurchaseOrder`, … | Inventory |
| `EmployeeFaceProfile`, `AttendanceRecord` | Face attendance |
| `SalonSubscription`, `PlatformInvoice` | SaaS billing |
| `SupportConversation`, `SupportMessage` | In-app support |
| `MembershipPlan`, `CustomerMembership`, … | Memberships & loyalty |

### User model (auth)
```prisma
model User {
  id           String        @id @default(cuid())
  email        String        @unique
  password     String        // bcrypt hash
  name         String
  role         String        @default("owner")  // owner | manager | staff
  isSuperAdmin Boolean       @default(false)
  platformRole PlatformRole? // SUPER_ADMIN | CUSTOMER_SUPPORT
  isActive     Boolean       @default(true)
  salonId      String?       // null for platform admins
  salon        Salon?
}
```

### Tenant isolation rule
**Always filter by `salonId` from session** in Server Actions:
```ts
const session = await requireSession();
const salonId = session.user.salonId!;
await prisma.customer.findMany({ where: { salonId } });
```
Never trust client-provided `salonId` without verifying against session.

---

## 8. Plans & Feature Gating

### Plans (`SalonPlan` enum)
| Plan | Price (INR/mo) | Modules |
|------|----------------|---------|
| `BASIC` | ₹600 | Dashboard, appointments, walk-in, customers, billing, services, staff, settings |
| `ENTERPRISE` | ₹1,999 | All modules including inventory, reports, sales, memberships, analytics, consultation |

Defined in `src/lib/plans.ts` and `src/lib/plan-access.ts`.

### Gating components
- `PlanProvider` / `PlanGate` — wrap dashboard content
- `AccessGate` — blocks access when subscription overdue
- Sidebar nav filtered by plan module access

---

## 9. Server Actions (Primary Mutation Layer)

All in `src/actions/` with `"use server"` at top.

### Pattern
```ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { someSchema } from "@/lib/validations";
import { revalidateSalonCache } from "@/lib/salon-cache";

export async function doSomethingAction(data: unknown) {
  const session = await requireSession();
  const salonId = session.user.salonId!;

  const parsed = someSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // ... prisma mutation scoped to salonId ...

  revalidateSalonCache(salonId, "relevant-tag");
  return { success: true };
}
```

### Action files by domain
| File | Domain |
|------|--------|
| `auth.ts` | Signup, onboarding, password reset |
| `salon.ts` | Salon settings |
| `employees.ts`, `team.ts` | Staff management |
| `customers.ts` | Client CRM |
| `services.ts`, `service-categories.ts` | Catalog |
| `appointments.ts`, `ai-scheduling.ts` | Scheduling |
| `queue.ts` | Walk-in queue |
| `billing.ts`, `sales.ts`, `daily-sales.ts` | Invoicing & sales |
| `inventory/*` | Stock, POs, GRN, transfers |
| `reports.ts` | Analytics |
| `attendance.ts` | Face check-in |
| `memberships.ts` | Membership plans |
| `subscription.ts` | SaaS subscription state |
| `platform-admin.ts`, `platform-users.ts` | Admin panel |
| `support-chat.ts` | Support tickets |
| `whatsapp.ts` | WhatsApp messaging |
| `hair-consultations.ts`, `hairstyles.ts` | AI hair consultation |

### Validation
All Zod schemas live in **`src/lib/validations.ts`**. Add new schemas there, import in actions.

### Caching
`src/lib/salon-cache.ts` — `cachedBySalon()` + `revalidateSalonCache()` for per-tenant Next.js cache tags.

---

## 10. API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers |
| `/api/cron/send-reminders` | POST | SMS appointment reminders |
| `/api/cron/sync-subscriptions` | POST | Subscription sync |
| `/api/cron/bootstrap-slugs` | POST | Backfill salon slugs |
| `/api/queue/snapshot` | GET | Real-time queue polling |
| `/api/dashboard/widgets` | GET | Dashboard widget data |
| `/api/layout/alerts` | GET | Header alert count |
| `/api/uploads/[...path]` | GET | Local file serving (dev) |
| `/api/admin/impersonate` | POST | Admin impersonation |
| `/api/salons/lookup` | GET | Salon slug lookup |
| `/api/hairstyles`, `/api/hair-consultations` | CRUD | Hair consultation feature |

---

## 11. Key `src/lib/` Files

| File | Purpose |
|------|---------|
| `auth.ts` / `auth.config.ts` | NextAuth setup |
| `prisma.ts` / `create-prisma-client.ts` | DB client singleton |
| `database-url.ts` | Env URL resolution (Railway public URL) |
| `salon-paths.ts` | Multi-tenant routing helpers |
| `salon-slug.ts` | Slug generation on signup |
| `platform-permissions.ts` | Admin role checks |
| `plans.ts` / `plan-access.ts` | Plan modules & gating |
| `validations.ts` | All Zod schemas |
| `sign-in-errors.ts` | Map auth errors to user messages |
| `demo-users.ts` | Demo password sync |
| `onboarding.ts` | Signup wizard defaults |
| `subscription.ts` | Trial/overdue logic |
| `salon-cache.ts` | Per-tenant caching |
| `email.ts` | Resend transactional email |
| `whatsapp/` | WhatsApp integration |
| `face-api-client.ts` | Attendance face detection |

---

## 12. UI Components

| Directory | Contents |
|-----------|----------|
| `components/ui/` | shadcn primitives (Button, Dialog, Input, …) |
| `components/dashboard/` | Shell, sidebar, header, widgets |
| `components/admin/` | Admin panel sidebar & workspace |
| `components/billing/` | Invoice forms, modals, tables |
| `components/inventory/` | Stock management UI |
| `components/reports/` | Report pages & charts |
| `components/landing-v2/` | Marketing site sections |
| `components/plans/` | PlanGate, PlanProvider |

### Dashboard shell
`DashboardShell` wraps all salon pages — sidebar, header, mobile nav, record-sale FAB.

---

## 13. State Management

| Concern | Approach |
|---------|----------|
| Server data | Server Components + Prisma |
| Mutations | Server Actions |
| Auth session | NextAuth JWT (`getAuthSession()`, `useSession()` on client) |
| UI state | React `useState` / `useEffect` in client components |
| Plan context | `PlanProvider` React context |
| Form state | react-hook-form |

**No Redux, Zustand, or global client store.**

---

## 14. Environment Variables

Copy `.env.example` → `.env`. Required:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="<openssl rand -base64 32>"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Railway local dev
```env
DATABASE_URL="postgresql://...@postgres.railway.internal:5432/railway"  # may not work locally
DATABASE_PUBLIC_URL="postgresql://...@xxxx.proxy.rlwy.net:PORT/railway"     # use this locally
```

### Optional
| Variable | Feature |
|----------|---------|
| `TWILIO_*` | SMS reminders (demo mode without) |
| `OPENAI_API_KEY` | AI scheduling explanations |
| `RESEND_API_KEY`, `EMAIL_FROM` | Password reset emails |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob for production uploads |

---

## 15. Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | `prisma generate` + `next dev` |
| `npm run build` | generate + migrate + build |
| `npm run db:migrate` | Dev migrations |
| `npm run db:migrate:deploy` | Production migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:check` | Verify DB connection + admin exists |
| `npm run db:ensure-admin` | Create/reset `admin@salon.ai` |
| `npm run db:studio` | Prisma Studio GUI |

---

## 16. Conventions for Making Changes

### DO
- Read **`AGENTS.md`** — Next.js 16 has breaking changes vs older versions
- Scope all salon queries by **`session.user.salonId`**
- Add Zod schemas to **`src/lib/validations.ts`**
- Put mutations in **`src/actions/`** with `"use server"`
- Use path helpers from **`src/lib/salon-paths.ts`** for links
- Match existing naming: `*-client.tsx` for client components, `page.tsx` for routes
- Use **`requireSession()`** or role-specific auth helpers in actions
- Call **`revalidateSalonCache()`** after mutations that affect cached data
- Keep diffs minimal — reuse existing components and patterns

### DON'T
- Edit `src/generated/prisma/` (run `prisma generate`)
- Use Redux or add unnecessary global state
- Hardcode salon IDs — always use session
- Use Railway internal URL (`*.railway.internal`) for local dev
- Commit `.env` or secrets
- Assume Next.js 14/15 API — check v16 docs

### Adding a new salon feature page
1. Create `src/app/(dashboard)/my-feature/page.tsx` (Server Component)
2. Add client UI in `src/components/my-feature/` if needed
3. Add Server Actions in `src/actions/my-feature.ts`
4. Add Zod schemas in `src/lib/validations.ts`
5. Add nav item in `src/lib/plans.ts` (with module) and sidebar config
6. If plan-gated, register module in `PLAN_FEATURES`
7. URL will be `/{salonSlug}/my-feature` automatically via middleware

### Adding a new API route
Create `src/app/api/my-route/route.ts` exporting `GET`/`POST` handlers.

---

## 17. Major Feature Modules (Dashboard)

| Module | Route(s) | Key actions |
|--------|----------|-------------|
| Dashboard | `/dashboard` | `dashboard.ts` |
| Walk-in / Queue | `/check-in`, `/queue` | `queue.ts` |
| Appointments | `/sales/appointments` | `appointments.ts`, `ai-scheduling.ts` |
| Clients | `/clients` | `customers.ts`, `segments.ts` |
| Billing | `/billing` | `billing.ts` |
| Catalog | `/catalog/services`, `/catalog/products` | `services.ts`, `inventory/products.ts` |
| Inventory | `/inventory/*` | `actions/inventory/*` |
| Team | `/team/members`, `/team/attendance` | `employees.ts`, `attendance.ts` |
| Reports | `/reports/*` | `reports.ts` |
| Memberships | `/memberships/*` | `memberships.ts` |
| Settings | `/settings/*` | `salon.ts`, `user-account.ts`, `subscription.ts` |
| Support | `/support` | `support-chat.ts` |
| Hair consultation | `/hair-consultation/*` | `hair-consultations.ts` |

---

## 18. Signup & Onboarding Flow

1. User visits `/signup`
2. Multi-step onboarding wizard (`src/app/(auth)/signup/onboarding-wizard.tsx`)
3. `onboardingSchema` validates all steps
4. `auth.ts` action creates `Salon` + `User` (owner) + default seats/services/stock categories
5. Generates unique slug via `generateUniqueSalonSlug()`
6. Creates trial subscription
7. Auto sign-in → redirect to `/{slug}/dashboard`

---

## 19. External Integrations

| Service | Config | Fallback |
|---------|--------|----------|
| Twilio SMS | `TWILIO_*` env | Demo mode — logs to console + saves to DB |
| OpenAI | `OPENAI_API_KEY` | Rule-based scheduling only |
| Resend email | `RESEND_API_KEY` | Logs reset link in dev console |
| Vercel Blob | `BLOB_READ_WRITE_TOKEN` | Local `uploads/` folder (dev only) |
| Face API | `public/models/` static files | Must copy from `@vladmandic/face-api/model` |

---

## 20. Deployment

- **Platform:** Vercel (primary)
- **Database:** Vercel Postgres / Neon / Railway
- **Build:** `prisma generate` → `prisma migrate deploy` → `next build`
- **Production URL:** `AUTH_URL` and `NEXT_PUBLIC_APP_URL` must match canonical domain
- **Post-deploy:** run `npm run db:seed` or `npm run db:ensure-admin` against production DB
- **Cron:** Configure Vercel Cron for `/api/cron/send-reminders`, `/api/cron/sync-subscriptions`

See `README.md` for full Vercel deploy steps.

---

## 21. Troubleshooting

| Problem | Fix |
|---------|-----|
| `MissingSecret` / auth error page | Set `AUTH_SECRET` in `.env`, restart dev server |
| Invalid email/password (DB OK) | Wrong browser autofill — use incognito or clear saved passwords |
| DB connection failed locally on Railway | Set `DATABASE_PUBLIC_URL` to public proxy URL |
| Login works in script but not browser | Check Network tab POST body password; run `db:ensure-admin` |
| Middleware deprecation warning | Next.js 16 prefers `proxy` over `middleware` — existing middleware still works |
| Prisma client not found | Run `npm run dev` or `npx prisma generate` |
| Face attendance not working | Copy models to `public/models/` |

Diagnostic scripts:
- `npm run db:check`
- `npx tsx scripts/diagnose-admin-password.ts`

---

## 22. Quick Reference for AI Assistants

When the user asks you to change something:

1. **Identify scope** — salon feature vs admin vs marketing vs auth
2. **Find the page** — `src/app/(dashboard)/...` or `src/app/admin/...`
3. **Find mutations** — matching file in `src/actions/`
4. **Find validation** — `src/lib/validations.ts`
5. **Check auth** — does it need `requireSession()` or `requirePlatformAdmin()`?
6. **Check plan gate** — is the module BASIC or ENTERPRISE only?
7. **Check tenant scope** — filter by `salonId` from session
8. **Update nav** — if new page, add to sidebar in `src/lib/plans.ts` / sidebar component
9. **Test locally** — `npm run dev`, use demo or admin credentials above

**Brand names in UI:** "Glow Desk" (admin/internal), "Go Tix" (salon-facing/marketing)

**Currency:** INR (₹) — default in schema and billing

**Timezone:** Uses `date-fns`; store dates as UTC in PostgreSQL

---

*Last updated: project structure as of Next.js 16.2, Prisma 7.9, NextAuth v5 beta.*
