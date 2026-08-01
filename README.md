# Glow Desk

Multi-tenant salon management SaaS built with Next.js, Prisma, and NextAuth.

## Features

- **Multi-tenant auth** — Each signup creates an isolated salon with owner account
- **Dashboard** — Live overview of queue, staff, seats, billing, SMS, and appointments
- **Employees** — CRUD with roles, specialties, status, and service assignments
- **Team attendance** — Face recognition check-in/out kiosk, daily log, and monthly reports
- **Services** — Service catalog with pricing (INR), duration, categories, and staff mapping
- **Seats** — Configure workstations and track availability
- **Walk-in queue** — Check-in customers, assign stylists/seats, track service progress
- **Appointments** — Schedule future bookings with calendar-style list views
- **Billing** — Invoices with line items, payment tracking, printable views, revenue stats (INR)
- **SMS reminders** — Auto-schedule appointment reminders 24h ahead; demo mode without Twilio
- **AI scheduling** — Smart time slot suggestions with optional OpenAI explanations

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui components
- Prisma ORM (PostgreSQL — Vercel Postgres, Neon, or local Docker)
- NextAuth.js (Credentials)
- Zod validation

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL (local Docker, [Neon](https://neon.tech) free tier, or Vercel Postgres)

### Setup

```bash
cd ~/Projects/salon-ai
npm install
cp .env.example .env
```

Generate a secure `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

Update `.env` with the generated secret and a PostgreSQL `DATABASE_URL`.

**Local Postgres with Docker:**

```bash
docker run --name salon-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=salon_ai -p 5432:5432 -d postgres:16
```

Then set in `.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/salon_ai?schema=public"
AUTH_URL="http://localhost:3000"
```

### Database

```bash
npx prisma migrate dev
npm run db:seed   # optional demo data
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Account (after seeding)

- **Email:** demo@salon.ai
- **Password:** demo1234

### Platform Admin (after seeding)

- **URL:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Email:** admin@salon.ai
- **Password:** admin1234

Use the admin panel to view all salon signups, subscription status (trial vs monthly), and tenant details.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (pooled URL for the app) |
| `DIRECT_DATABASE_URL` | Direct/non-pooled URL for Prisma migrations (Neon/Vercel Postgres) |
| `AUTH_SECRET` | NextAuth secret key |
| `AUTH_URL` | App URL (`http://localhost:3000` locally; production Vercel URL) |
| `POSTGRES_URL` | Auto-set by Vercel Postgres — map to `DATABASE_URL` if needed |
| `POSTGRES_URL_NON_POOLING` | Auto-set by Vercel Postgres — use as `DIRECT_DATABASE_URL` for migrations |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for stock bill attachments in production (optional) |
| `TWILIO_ACCOUNT_SID` | Twilio account SID (optional) |
| `TWILIO_AUTH_TOKEN` | Twilio auth token (optional) |
| `TWILIO_PHONE_NUMBER` | Twilio sender phone number (optional) |
| `OPENAI_API_KEY` | OpenAI API key for AI scheduling explanations (optional) |

Without Twilio credentials, SMS runs in **demo mode** (logged to console + stored in DB). Without OpenAI, AI scheduling uses rule-based slot ranking.

### Face recognition models (attendance)

Team attendance uses browser-based face recognition via `@vladmandic/face-api`. Model weights are served from `public/models/`.

After `npm install`, copy models from the package (already done if you cloned a fresh setup):

```bash
mkdir -p public/models
cp -r node_modules/@vladmandic/face-api/model/* public/models/
```

Required files include `tiny_face_detector_model.bin`, `face_landmark_68_model.bin`, and `face_recognition_model.bin` (plus their manifest JSON files).

Enroll faces at **Team → Attendance → Enroll faces** (owner/manager only), then use **Team → Attendance** as the kiosk. Allow camera access when prompted.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/signup` | Create salon account |
| `/login` | Sign in |
| `/admin/login` | Platform admin sign in |
| `/admin` | Admin dashboard (salon stats) |
| `/admin/salons` | All salons list with plan status |
| `/admin/salons/[id]` | Salon tenant detail |
| `/dashboard` | Overview dashboard |
| `/check-in` | Walk-in customer check-in |
| `/queue` | Waiting list & assignment |
| `/employees` | Team management |
| `/services` | Service catalog |
| `/seats` | Workstation configuration |
| `/appointments` | Scheduled bookings |
| `/schedule/ai` | AI-powered scheduling suggestions |
| `/billing` | Invoices and payments |
| `/billing/[id]` | Printable invoice view |
| `/settings/notifications` | SMS reminders configuration |
| `/team/attendance` | Face check-in/out kiosk |
| `/team/attendance/enroll` | Enroll team member faces |
| `/team/attendance/log` | Daily attendance log |
| `/team/attendance/reports` | Monthly attendance reports |

## API

| Endpoint | Description |
|----------|-------------|
| `POST /api/cron/send-reminders` | Process due SMS reminders |

## Deploy to Vercel

Glow Desk runs fully on Vercel: Next.js frontend/API on Vercel, PostgreSQL via **Vercel Postgres** (Neon) or the [Neon Vercel integration](https://vercel.com/integrations/neon).

### Fix production login (3 steps)

Production login (`demo@salon.ai` / `demo1234`) requires a PostgreSQL database. If login shows "Invalid email or password", the app is deployed but has no DB yet.

**Step 1 — Add Postgres (dashboard, ~2 min)**

1. Open [Vercel → salon-ai → Storage](https://vercel.com/vsachi/salon-ai/stores) → **Create Database** → **Postgres** (Neon).
2. Connect it to the **salon-ai** project for **Production** and **Preview**.
3. If the CLI prompted for marketplace terms first, accept at [Neon integration terms](https://vercel.com/vsachi/~/integrations/accept-terms/neon?source=cli), then run:
   ```bash
   npx vercel integration add neon -e production -e preview
   ```

Vercel injects `POSTGRES_URL` and `POSTGRES_URL_NON_POOLING`. The app reads these automatically (no manual copy required unless you prefer explicit names).

**Step 2 — Redeploy**

```bash
npx vercel deploy --prod
```

Build runs `prisma migrate deploy` when `POSTGRES_URL` is present.

**Step 3 — Seed demo data**

```bash
npx vercel env pull .env.production.local --environment=production
source .env.production.local  # or export POSTGRES_URL manually
npm run db:seed
```

Then sign in at [https://salon-ai-sandy.vercel.app/login](https://salon-ai-sandy.vercel.app/login) with `demo@salon.ai` / `demo1234`.

**Already configured on production:** `AUTH_SECRET`, `AUTH_URL` (`https://salon-ai-sandy.vercel.app`).

Optional explicit env mapping (only if you want named vars in the dashboard):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Same as `POSTGRES_URL` |
| `DIRECT_DATABASE_URL` | Same as `POSTGRES_URL_NON_POOLING` |

### 1. Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repo.
2. Framework preset: **Next.js** (auto-detected).
3. Build command (default): `npm run build` — runs `prisma generate`, `prisma migrate deploy`, and `next build`.

### 3. Add Vercel Postgres

1. In your Vercel project → **Storage** → **Create Database** → **Postgres**.
2. Connect the database to the project. Vercel injects:
   - `POSTGRES_URL` (pooled — use for the app)
   - `POSTGRES_URL_NON_POOLING` (direct — use for migrations)

### 4. Set environment variables

In **Project Settings → Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Same as `POSTGRES_URL` (pooled connection) |
| `DIRECT_DATABASE_URL` | Same as `POSTGRES_URL_NON_POOLING` |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://your-app.vercel.app` (your production URL) |

Optional: `TWILIO_*`, `OPENAI_API_KEY`, `BLOB_READ_WRITE_TOKEN`.

### 5. Deploy

Trigger a deploy from the Vercel dashboard or push to `main`. Migrations run automatically during build via `prisma migrate deploy`.

### 6. Seed demo data (optional)

After first deploy, run locally against production DB:

```bash
DATABASE_URL="your-postgres-url" npm run db:seed
```

### CLI deploy

```bash
npx vercel login
npx vercel link
npx vercel env pull .env.local   # pulls Vercel env vars
npx vercel deploy --prod
```

### Production limitations

- **Bill attachments** — Local `uploads/` folder does not persist on serverless. Stock purchases work without attachments; for file uploads in production, add [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) and set `BLOB_READ_WRITE_TOKEN`.
- **Face recognition models** — Served from `public/models/` (static files deploy fine).
- **Cron SMS** — Configure a Vercel Cron job for `POST /api/cron/send-reminders` if using SMS reminders.

### Connection string format

```
postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

Neon/Vercel pooled URLs often include `-pooler` in the hostname.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (runs migrations when Postgres URL is set) |
| `npm run db:migrate` | Run Prisma migrations (dev) |
| `npm run db:migrate:deploy` | Apply migrations (production/CI) |
| `npm run db:seed` | Seed demo salon data |
| `npm run db:studio` | Open Prisma Studio |
