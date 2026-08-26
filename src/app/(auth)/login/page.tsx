import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { warmDatabasePool } from "@/lib/warm-database-pool";
import LoginForm from "./login-form";
import LoginWorkspaceGate from "./login-workspace-gate";

const salonSelect = {
  name: true,
  slug: true,
  logoUrl: true,
  address: true,
  addressLine1: true,
  city: true,
  state: true,
  pincode: true,
  businessPhone: true,
  phone: true,
} as const;

async function findSalonBySlug(salonSlug: string) {
  try {
    return await prisma.salon.findUnique({
      where: { slug: salonSlug },
      select: salonSelect,
    });
  } catch (error) {
    console.error("[login] failed to load salon by slug:", error);
    return null;
  }
}

async function resolveSalonSlug() {
  const headerStore = await headers();
  const fromHeader =
    headerStore.get("x-salon-slug") ??
    headerStore.get("x-middleware-request-x-salon-slug");
  if (fromHeader) return fromHeader;
  return (await cookies()).get("salon-slug")?.value ?? null;
}

export async function generateMetadata(): Promise<Metadata> {
  const salonSlug = await resolveSalonSlug();
  if (!salonSlug) {
    return { title: "Login" };
  }

  const salon = await findSalonBySlug(salonSlug);

  return {
    title: salon ? `Login — ${salon.name}` : "Login",
  };
}

export default async function LoginPage() {
  void warmDatabasePool();

  const salonSlug = await resolveSalonSlug();

  // No salon context (marketing /login) → workspace picker.
  // Missing/unreachable salon → picker too (never 404 the Login CTA).
  if (!salonSlug) {
    return <LoginWorkspaceGate />;
  }

  const salon = await findSalonBySlug(salonSlug);

  if (!salon) {
    return <LoginWorkspaceGate />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginForm salon={salon} />
    </Suspense>
  );
}
