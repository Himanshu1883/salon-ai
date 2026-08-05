# Gotix marketing frontend redesign

Standalone Vite + TanStack Start React redesign of the Salon AI / Gotix marketing site.

This folder is added alongside the existing Next.js app so **backend, Prisma, and NextAuth stay untouched**. It is not wired into the Next.js build yet — run it separately for review.

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
