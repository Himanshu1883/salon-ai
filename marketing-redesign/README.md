# Gotix marketing frontend redesign (source archive)

Standalone Vite + TanStack Start React redesign of the Salon AI / Gotix marketing site.

**Ported into the Next.js App Router** on branch `frontend-redesign` (`src/components/site`, `src/app/(marketing)`, etc.). This folder is kept as the original Vite source for reference. Backend, Prisma, and NextAuth were not modified by the port.

## Stack

- React 19 + Vite
- TanStack Router / Start
- Tailwind CSS v4 + shadcn/ui
- Framer Motion

## Run locally

```sh
cd marketing-redesign
npm install
npm run dev
```

## Important

- Do **not** replace root `package.json`, `src/app`, `prisma/`, or API routes with this folder.
- Next step (optional): port these pages into the Next.js App Router marketing routes while keeping auth/dashboard/API intact.
